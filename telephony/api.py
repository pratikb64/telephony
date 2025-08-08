import frappe
from frappe.query_builder import Order
from pypika.functions import Replace

from telephony.utils import are_same_phone_number, parse_phone_number


@frappe.whitelist()
def is_call_integration_enabled():
	twilio_enabled = frappe.db.get_single_value("TF Twilio Settings", "enabled")
	exotel_enabled = frappe.db.get_single_value("TF Exotel Settings", "enabled")

	return {
		"twilio_enabled": twilio_enabled,
		"exotel_enabled": exotel_enabled,
		"default_calling_medium": get_user_default_calling_medium(),
	}


@frappe.whitelist()
def set_default_calling_medium(medium):
	if not frappe.db.exists("TF Telephony Agent", frappe.session.user):
		frappe.get_doc(
			{
				"doctype": "TF Telephony Agent",
				"user": frappe.session.user,
				"default_medium": medium,
			}
		).insert(ignore_permissions=True)
	else:
		frappe.db.set_value("TF Telephony Agent", frappe.session.user, "default_medium", medium)

	return get_user_default_calling_medium()


@frappe.whitelist()
def get_contact_by_phone_number(phone_number):
	"""Get contact by phone number."""
	number = parse_phone_number(phone_number)

	if number.get("is_valid"):
		return get_contact(number.get("national_number"))
	else:
		return get_contact(phone_number)


def get_user_default_calling_medium():
	if not frappe.db.exists("TF Telephony Agent", frappe.session.user):
		return None

	default_medium = frappe.db.get_value("TF Telephony Agent", frappe.session.user, "default_medium")

	if not default_medium:
		return None

	return default_medium


def get_contact(phone_number):
	if not phone_number:
		return {"mobile_no": phone_number}

	cleaned_number = (
		phone_number.strip()
		.replace(" ", "")
		.replace("-", "")
		.replace("(", "")
		.replace(")", "")
		.replace("+", "")
	)

	# Check if the number is associated with a contact
	Contact = frappe.qb.DocType("Contact")
	normalized_phone = Replace(
		Replace(Replace(Replace(Replace(Contact.mobile_no, " ", ""), "-", ""), "(", ""), ")", ""), "+", ""
	)

	query = (
		frappe.qb.from_(Contact)
		.select(Contact.name, Contact.full_name, Contact.image, Contact.mobile_no)
		.where(normalized_phone.like(f"%{cleaned_number}%"))
		.orderby("modified", order=Order.desc)
	)
	contacts = query.run(as_dict=True)

	return contacts[0]
