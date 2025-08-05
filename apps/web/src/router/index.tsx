import { createBrowserRouter } from "react-router-dom";
// Import pages directly for now
import { LoginPage } from "../pages/login-page";
import { ProfilePage } from "../pages/ProfilePage";
import { RegisterPage } from "../pages/register-page";
import { SettingsPage } from "../pages/SettingsPage";
import { aboutRoute } from "./routes/about";
import { homeRoute } from "./routes/home";
import { rootRoute } from "./routes/root";

export const router = createBrowserRouter([
	{
		path: "/",
		element: rootRoute.element,
		children: [
			{
				index: true,
				element: homeRoute.element,
			},
			{
				path: "about",
				element: aboutRoute.element,
			},
			{
				path: "profile",
				element: <ProfilePage />,
			},
			{
				path: "settings",
				element: <SettingsPage />,
			},
		],
	},
	{
		path: "/login",
		element: <LoginPage />,
	},
	{
		path: "/register",
		element: <RegisterPage />,
	},
]);
