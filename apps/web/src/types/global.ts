// Global type definitions for the application

export interface User {
	id: string;
	name: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Tournament {
	id: string;
	name: string;
	description?: string;
	startDate: Date;
	endDate?: Date;
	status: "upcoming" | "active" | "completed";
	maxPlayers: number;
	currentPlayers: number;
}

export interface Player {
	id: string;
	userId: string;
	name: string;
	ranking: number;
	totalPoints: number;
	wins: number;
	losses: number;
}

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	errors?: string[];
}

export interface RouteConfig {
	path: string;
	element: React.ReactElement;
	children?: RouteConfig[];
}
