import { call } from "frappe-ui";
import { ref } from "vue";
import { getCachedListResource, getCachedResource } from "frappe-ui";
import { io } from "socket.io-client";
import { socketio_port } from "../../../../sites/common_site_config.json";

let callMethod = (number?: string) => {};

export function setMakeCall(value) {
  callMethod = value;
}

export function makeCall(number) {
  callMethod(number);
}

export const callEnabled = ref(false);
export const twilioEnabled = ref(false);
export const exotelEnabled = ref(false);
export const defaultCallingMedium = ref("");

call("telephony.api.is_call_integration_enabled").then((data) => {
  twilioEnabled.value = Boolean(data.twilio_enabled);
  exotelEnabled.value = Boolean(data.exotel_enabled);
  defaultCallingMedium.value = data.default_calling_medium;
  callEnabled.value = twilioEnabled.value || exotelEnabled.value;
});

function init() {
  let host = window.location.hostname;
  let siteName = window.site_name || host;
  let port = window.location.port ? `:${socketio_port}` : "";
  let protocol = port ? "http" : "https";
  let url = `${protocol}://${host}${port}/${siteName}`;

  const socket = io(url, {
    withCredentials: true,
    reconnectionAttempts: 5,
  });

  socket.on("refetch_resource", (data) => {
    if (data.cache_key) {
      const resource =
        getCachedResource(data.cache_key) ||
        getCachedListResource(data.cache_key);
      if (resource) {
        resource.reload();
      }
    }
  });

  return socket;
}

const socket = init();

export function telephonyStore() {
  return {
    callEnabled,
    twilioEnabled,
    exotelEnabled,
    defaultCallingMedium,
    callMethod,
    setMakeCall,
    makeCall,
    socket,
  };
}
