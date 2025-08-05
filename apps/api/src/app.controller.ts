import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("app")
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

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
}
