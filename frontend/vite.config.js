import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import frappeui from "frappe-ui/vite";
import dts from "vite-plugin-dts";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		frappeui({
			frappeProxy: true,
			lucideIcons: true,
			jinjaBootData: true,
			// buildConfig: {
			// 	outDir: `../telephony/public/frontend`,
			// 	emptyOutDir: true,
			// 	indexHtmlPath: "../telephony/www/index.html",
			// },
		}),
		dts({
			insertTypesEntry: true,
		}),
	],
	optimizeDeps: {
		include: [
			"feather-icons",
			"showdown",
			"tailwind.config.js",
			"prosemirror-state",
			"prosemirror-view",
			"lowlight",
		],
	},
});
