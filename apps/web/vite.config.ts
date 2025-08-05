import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	css: {
		postcss: "./postcss.config.js",
	},
	resolve: {
		alias: {
			"@skillers/ui": path.resolve(__dirname, "../../packages/ui/src"),
			"@skillers/utils": path.resolve(__dirname, "../../packages/utils/src"),
			"@ui": path.resolve(__dirname, "../../packages/ui/src"),
		},
	},
});
