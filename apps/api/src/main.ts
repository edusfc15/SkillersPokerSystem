import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Global exception filter (para tratar erros de validação Zod e outros)
	app.useGlobalFilters(new GlobalExceptionFilter());

	// CORS
	app.enableCors();

	// Swagger documentation
	const config = new DocumentBuilder()
		.setTitle("Skillers Poker System API")
		.setDescription("API for managing poker tournaments and players")
		.setVersion("1.0")
		.addTag("poker")
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	const port = process.env.PORT || 3001;
	await app.listen(port);
	console.log(`Server is running on http://localhost:${port}`);
	console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
