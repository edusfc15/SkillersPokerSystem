import { Outlet } from "react-router-dom";
import { Header } from "../components/header";
import { PageTransition } from "../components/page-transition";

export function RootLayout() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			{/* Header global */}
			<Header />

			{/* Conteúdo das páginas */}
			<main className="container mx-auto px-4 py-8">
				<PageTransition>
					<Outlet />
				</PageTransition>
			</main>

			{/* Footer global */}
			<footer className="border-t bg-card mt-auto">
				<div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
					<p>Sistema usando: Vibrant Orange, White, Blue Gradient, Black</p>
				</div>
			</footer>
		</div>
	);
}
