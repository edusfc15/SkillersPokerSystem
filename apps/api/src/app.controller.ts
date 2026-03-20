import { Controller, Get, Param, Put, Post, Delete, Body, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma.service";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { CurrentUser } from "./auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "./auth/interfaces/auth.interface";

@ApiTags("app")
@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly prisma: PrismaService,
	) {}

	@Get()
	@ApiOperation({ summary: "Get application info" })
	@ApiResponse({
		status: 200,
		description: "Application info returned successfully",
	})
	getHello(): string {
		return this.appService.getHello();
	}

	@Get("health")
	@ApiOperation({ summary: "Health check" })
	@ApiResponse({ status: 200, description: "Application is healthy" })
	getHealth(): object {
		return this.appService.getHealth();
	}

	private async isPlayerAdmin(userId: string): Promise<boolean> {
		const user = await this.prisma.users.findUnique({
			where: { id: userId },
			select: { isadmin: true },
		});
		return user?.isadmin ?? false;
	}

	private async getUserPlayer(userId: string) {
		return this.prisma.players.findFirst({
			where: { userid: userId },
		});
	}

	private formatDateToBrazilian(date: Date): string {
		if (!date) return '';
		const d = new Date(date);
		const day = String(d.getDate()).padStart(2, '0');
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	}

	@Get("players")
	@ApiOperation({ summary: "Get all players" })
	@ApiResponse({ status: 200, description: "Players list returned successfully" })
	async getActivePlayers() {
		const players = await this.prisma.players.findMany({
			select: {
				id: true,
				name: true,
				imageurl: true,
				isactive: true,
				createddate: true,
				lastmodifieddate: true,
				viewcount: true,
				users: {
					select: { isadmin: true },
				},
				gamedetails: {
					select: {
						gameid: true,
						value: true,
						chipstotal: true,
						tip: true,
					},
				},
			},
			orderBy: {
				lastmodifieddate: 'desc',
			},
		});

		// Calcula estatísticas para cada jogador
		return players.map((player) => {
			// Conta games únicos agrupando por gameid
			const uniqueGames = new Set(player.gamedetails.map(gd => gd.gameid.toString()));
			return {
				id: player.id,
				name: player.name,
				imageurl: player.imageurl,
				isactive: player.isactive,
				isadmin: player.users?.isadmin ?? false,
				registrationDate: player.createddate.toISOString(),
				registrationDateFormatted: this.formatDateToBrazilian(player.createddate),
				lastActivity: player.lastmodifieddate.toISOString(),
				lastActivityFormatted: this.formatDateToBrazilian(player.lastmodifieddate),
				gamesPlayed: uniqueGames.size,
				viewCount: player.viewcount,
				totalBuyIn: player.gamedetails.reduce((sum, gd) => sum + Number(gd.value || 0), 0),
				totalCashout: player.gamedetails.reduce((sum, gd) => sum + Number(gd.chipstotal || 0), 0),
				totalTip: player.gamedetails.reduce((sum, gd) => sum + Number(gd.tip || 0), 0),
				totalProfit: player.gamedetails.reduce((sum, gd) => sum + (Number(gd.chipstotal || 0) - Number(gd.value || 0)), 0),
			};
		});
	}

	@Get("players/:id")
	@ApiOperation({ summary: "Get player details by ID" })
	@ApiResponse({ status: 200, description: "Player details returned successfully" })
	@ApiResponse({ status: 404, description: "Player not found" })
	async getPlayerDetails(@Param("id") id: string) {
		const player = await this.prisma.players.findUnique({
			where: {
				id: BigInt(id),
			},
			select: {
				id: true,
				name: true,
				imageurl: true,
				isactive: true,
				userid: true,
				createddate: true,
				lastmodifieddate: true,
				viewcount: true,
				users: {
					select: { isadmin: true },
				},
				gamedetails: {
					select: {
						gameid: true,
						value: true,
						tip: true,
						chipstotal: true,
						ispaid: true,
						games: {
							select: {
								createddate: true,
							},
						},
					},
				},
			},
		});

		if (!player) {
			return { error: "Player not found" };
		}

		// Calculate stats
		const totalBuyIn = player.gamedetails.reduce((sum, gd) => sum + parseFloat(gd.value.toString()), 0);
		const totalCashout = player.gamedetails.reduce((sum, gd) => sum + parseFloat(gd.chipstotal.toString()), 0);
		const totalProfit = totalCashout - totalBuyIn;
		const totalTip = player.gamedetails.reduce((sum, gd) => sum + parseFloat(gd.tip.toString()), 0);

		// Conta games únicos agrupando por gameid
		const uniqueGames = new Set(player.gamedetails.map(gd => gd.gameid.toString()));

		return {
			...player,
			isadmin: player.users?.isadmin ?? false,
			totalBuyIn,
			totalCashout,
			totalProfit,
			totalTip,
			gamesPlayed: uniqueGames.size,
			viewCount: player.viewcount,
		};
	}

	@Put("players/:id")
	@ApiOperation({ summary: "Update player" })
	@ApiResponse({ status: 200, description: "Player updated successfully" })
	@ApiResponse({ status: 404, description: "Player not found" })
	async updatePlayer(@Param("id") id: string, @Body() updateData: { name?: string; imageurl?: string; isactive?: boolean }) {
		try {
			const player = await this.prisma.players.update({
				where: {
					id: BigInt(id),
				},
				data: {
					...(updateData.name && { name: updateData.name }),
					...(updateData.imageurl !== undefined && { imageurl: updateData.imageurl }),
					...(updateData.isactive !== undefined && { isactive: updateData.isactive }),
					lastmodifieddate: new Date(),
				},
				select: {
					id: true,
					name: true,
					imageurl: true,
					isactive: true,
				},
			});

			return { success: true, data: player };
		} catch (error) {
			return { success: false, error: "Failed to update player" };
		}
	}

	@Post("players")
	@ApiOperation({ summary: "Create new player" })
	@ApiResponse({ status: 201, description: "Player created successfully" })
	@ApiResponse({ status: 400, description: "Invalid input" })
	async createPlayer(@Body() createData: { name: string; imageurl?: string; userid?: string; isactive?: boolean }) {
		try {
			if (!createData.name) {
				return { success: false, error: "Name is required" };
			}

			const player = await this.prisma.players.create({
				data: {
					name: createData.name,
					imageurl: createData.imageurl || null,
					userid: createData.userid || null,
					isactive: createData.isactive || false,
					createddate: new Date(),
					lastmodifieddate: new Date(),
					viewcount: 0,
					firstgamedate: new Date(),
				},
				select: {
					id: true,
					name: true,
					imageurl: true,
					isactive: true,
					createddate: true,
					lastmodifieddate: true,
					viewcount: true,
				},
			});

			return { 
				success: true, 
				data: {
					...player,
					registrationDate: player.createddate.toISOString(),
					registrationDateFormatted: this.formatDateToBrazilian(player.createddate),
					lastActivity: player.lastmodifieddate.toISOString(),
					lastActivityFormatted: this.formatDateToBrazilian(player.lastmodifieddate),
					gamesPlayed: 0,
				}
			};
		} catch (error) {
			return { success: false, error: "Failed to create player" };
		}
	}

	@Get("players/admins")
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: "Get all admin players" })
	@ApiResponse({ status: 200, description: "Admin players list returned successfully" })
	async getAdminPlayers(@CurrentUser() user: AuthenticatedUser) {
		const isAdmin = await this.isPlayerAdmin(user.id);
		if (!isAdmin) {
			return { success: false, error: "Only administrators can view admin list" };
		}

		const adminUsers = await this.prisma.users.findMany({
			where: { isadmin: true },
			select: {
				id: true,
				username: true,
				displayname: true,
				isadmin: true,
				players: {
					select: {
						id: true,
						name: true,
						imageurl: true,
					},
					take: 1,
				},
			},
		});

		return {
			success: true,
			data: adminUsers.map((u) => ({
				userId: u.id,
				username: u.username,
				displayname: u.displayname,
				isadmin: u.isadmin,
				player: u.players[0] ?? null,
			})),
		};
	}

	@Post("players/:playerId/associate-user")
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Associate a user to a player" })
	@ApiResponse({ status: 200, description: "User associated successfully" })
	@ApiResponse({ status: 403, description: "Only administrators can associate users" })
	@ApiResponse({ status: 404, description: "Player or user not found" })
	async associateUserToPlayer(
		@CurrentUser() user: AuthenticatedUser,
		@Param("playerId") playerId: string,
		@Body() data: { userId: string },
	) {
		const isAdmin = await this.isPlayerAdmin(user.id);
		if (!isAdmin) {
			return { success: false, error: "Only administrators can associate users to players" };
		}

		try {
			const player = await this.prisma.players.findUnique({
				where: { id: BigInt(playerId) },
			});

			if (!player) {
				return { success: false, error: "Player not found" };
			}

			const targetUser = await this.prisma.users.findUnique({
				where: { id: data.userId },
			});

			if (!targetUser) {
				return { success: false, error: "User not found" };
			}

			// Check if user is already associated with another player
			const existingAssociation = await this.prisma.players.findFirst({
				where: { userid: data.userId },
			});

			if (existingAssociation && existingAssociation.id !== BigInt(playerId)) {
				return { success: false, error: "User is already associated with another player" };
			}

			const updatedPlayer = await this.prisma.players.update({
				where: { id: BigInt(playerId) },
				data: {
					userid: data.userId,
					lastmodifieddate: new Date(),
				},
				select: {
					id: true,
					name: true,
					imageurl: true,
					userid: true,
					isactive: true,
					users: {
						select: { isadmin: true },
					},
				},
			});

			return { success: true, data: { ...updatedPlayer, isadmin: updatedPlayer.users?.isadmin ?? false } };
		} catch (error) {
			return { success: false, error: "Failed to associate user to player" };
		}
	}

	@Post("players/:playerId/make-admin")
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Make a player an administrator" })
	@ApiResponse({ status: 200, description: "Player promoted to admin successfully" })
	@ApiResponse({ status: 403, description: "Only administrators can promote players" })
	@ApiResponse({ status: 404, description: "Player not found" })
	async makePlayerAdmin(
		@CurrentUser() user: AuthenticatedUser,
		@Param("playerId") playerId: string,
	) {
		const isAdmin = await this.isPlayerAdmin(user.id);
		if (!isAdmin) {
			return { success: false, error: "Only administrators can make players administrators" };
		}

		try {
			// 1. Get player to find userid
			const player = await this.prisma.players.findUnique({
				where: { id: BigInt(playerId) },
				select: { userid: true, name: true, imageurl: true, isactive: true },
			});

			if (!player) return { success: false, error: 'Player not found' };
			if (!player.userid) return { success: false, error: 'Player has no associated user' };

			// 2. Update users.isadmin
			await this.prisma.users.update({
				where: { id: player.userid },
				data: { isadmin: true, lastmodifieddate: new Date() },
			});

			return { success: true, data: { id: BigInt(playerId), name: player.name, imageurl: player.imageurl, isactive: player.isactive, isadmin: true } };
		} catch (error) {
			return { success: false, error: "Failed to promote player to admin" };
		}
	}

	@Delete("players/:playerId/remove-admin")
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Remove admin status from a player" })
	@ApiResponse({ status: 200, description: "Admin status removed successfully" })
	@ApiResponse({ status: 403, description: "Only administrators can remove admin status" })
	@ApiResponse({ status: 404, description: "Player not found" })
	async removePlayerAdmin(
		@CurrentUser() user: AuthenticatedUser,
		@Param("playerId") playerId: string,
	) {
		const isAdmin = await this.isPlayerAdmin(user.id);
		if (!isAdmin) {
			return { success: false, error: "Only administrators can remove admin status" };
		}

		try {
			// Prevent removing admin from the initial admin (ID = 1)
			if (BigInt(playerId) === BigInt(1)) {
				return { success: false, error: "Cannot remove admin status from the system administrator" };
			}

			// 1. Get player to find userid
			const player = await this.prisma.players.findUnique({
				where: { id: BigInt(playerId) },
				select: { userid: true, name: true, imageurl: true, isactive: true },
			});

			if (!player) return { success: false, error: 'Player not found' };
			if (!player.userid) return { success: false, error: 'Player has no associated user' };

			// 2. Update users.isadmin
			await this.prisma.users.update({
				where: { id: player.userid },
				data: { isadmin: false, lastmodifieddate: new Date() },
			});

			return { success: true, data: { id: BigInt(playerId), name: player.name, imageurl: player.imageurl, isactive: player.isactive, isadmin: false } };
		} catch (error) {
			return { success: false, error: "Failed to remove admin status" };
		}
	}
}
