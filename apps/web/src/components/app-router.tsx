import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "../pages/Home";
import { LoginPage } from "../pages/login-page";
import { RegisterPage } from "../pages/register-page";
import { GamesPage } from "../pages/GamesPage";
import { PokerGamesPage } from "../pages/poker-games-page";
import { CreateGamePage } from "../pages/CreateGamePage";

export function AppRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/games/create" element={<CreateGamePage />} />
				<Route path="/games" element={<GamesPage />} />
				<Route path="/poker-games" element={<PokerGamesPage />} />
				{/* Rota catch-all para redirecionar para home */}
				<Route path="*" element={<Home />} />
			</Routes>
		</BrowserRouter>
	);
}
