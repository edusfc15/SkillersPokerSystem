import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "../pages/home-page";
import { LoginPage } from "../pages/login-page";
import { RegisterPage } from "../pages/register-page";

export function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				{/* Rota catch-all para redirecionar para home */}
				<Route path="*" element={<HomePage />} />
			</Routes>
		</BrowserRouter>
	);
}
