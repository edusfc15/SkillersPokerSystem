import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
	intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			map((data) => {
				return this.transformBigInt(data);
			}),
		);
	}

	private transformBigInt(obj: any): any {
		if (obj === null || obj === undefined) {
			return obj;
		}

		if (typeof obj === 'bigint') {
			return obj.toString();
		}

		// Let NestJS handle Date serialization - don't touch it here
		// This prevents the "Invalid time value" error from invalid Date objects

		if (Array.isArray(obj)) {
			return obj.map((item) => this.transformBigInt(item));
		}

		if (typeof obj === 'object') {
			// Don't process Date objects
			if (obj instanceof Date) {
				return obj;
			}

			const transformed: any = {};
			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					transformed[key] = this.transformBigInt(obj[key]);
				}
			}
			return transformed;
		}

		return obj;
	}
}
