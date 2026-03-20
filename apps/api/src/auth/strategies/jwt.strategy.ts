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

	async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
		console.log('JWT Payload:', payload);
		return {
			id: payload.sub,
			username: payload.username,
			email: payload.email,
			displayName: payload.username,
			roles: payload.roles || [],
			emailConfirmed: true,
			lockoutEnabled: false,
			accessFailedCount: 0,
		};
	}
}
