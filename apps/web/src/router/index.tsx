import { createBrowserRouter } from "react-router-dom";
// Import pages directly for now
import { GamesPage } from "../pages/GamesPage";
import { LoginPage } from "../pages/login-page";
import { PlayersPage } from "../pages/PlayersPage";
import { ProfilePage } from "../pages/ProfilePage";
import { RegisterPage } from "../pages/register-page";
import { SettingsPage } from "../pages/SettingsPage";
import { About } from "../pages/About";
import { Home } from "../pages/Home";
import { RootLayout } from "../pages/RootLayout";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <Home />,
			},
			{
				path: "about",
				element: <About />,
			},
			{
				path: "games",
				element: <GamesPage />,
			},
			{
				path: "players",
				element: <PlayersPage />,
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
