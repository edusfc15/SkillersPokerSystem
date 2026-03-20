import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Starting database seed...");

	try {
		// Check if player with ID 1 exists
		const adminPlayer = await prisma.player.findFirst({
			where: { id: BigInt(1) },
		});

		if (adminPlayer) {
			console.log("✅ Player ID 1 already exists");
		} else {
			// Create a new admin player
			const newAdminPlayer = await prisma.player.create({
				data: {
					id: BigInt(1),
					name: "System Administrator",
					isactive: true,
					createddate: new Date(),
					lastmodifieddate: new Date(),
					firstgamedate: new Date(),
					viewcount: 0,
				},
			});
			console.log("✅ Created system administrator player:", newAdminPlayer.id);
		}

		// Note: isadmin is now on User model, not Player
		console.log("✅ Database seed completed successfully!");
		console.log("ℹ️  Note: isadmin field is now on User model");
	} catch (error) {
		console.error("❌ Error during seeding:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
