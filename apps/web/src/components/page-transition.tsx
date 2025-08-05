import type React from "react";
import { useEffect, useState } from "react";

interface PageTransitionProps {
	children: React.ReactNode;
	className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Pequeno delay para garantir que o DOM está pronto
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 10);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			className={`page-transition ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
			style={{
				transition: 'opacity 0.2s ease-in-out',
				minHeight: '100vh',
			}}
		>
			{children}
		</div>
	);
}
