import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { Header } from "../components/header";
import { PageTransition } from "../components/page-transition";

export function ProtectedLayout() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
					<p className="text-muted-foreground">Carregando...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/" replace />;
	}

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
					<p>Skillers Poker Club</p>
				</div>
			</footer>
		</div>
	);
}
