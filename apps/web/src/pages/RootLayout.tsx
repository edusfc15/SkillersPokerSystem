import { Outlet } from "react-router-dom";
import { PageTransition } from "../components/page-transition";

export function RootLayout() {
	return (
		<PageTransition>
			<Outlet />
		</PageTransition>
	);
}
