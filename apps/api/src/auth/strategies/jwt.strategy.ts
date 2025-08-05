import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import {
	AuthenticatedUser,
	JwtPayload,
} from "../interfaces/auth.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET || "your-secret-key",
		});
	}

	async validate(payload: JwtPayload): Promise<JwtPayload> {
		return payload;
	}
}
