import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/600.css";
import "@fontsource/figtree/700.css";
import "@ui/index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/auth-context";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<ThemeProvider defaultTheme="dark" storageKey="skillers-poker-theme">
				<App />
			</ThemeProvider>
		</AuthProvider>
	</StrictMode>,
);
