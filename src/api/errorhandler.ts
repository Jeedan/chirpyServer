import { NextFunction, Request, RequestHandler, Response } from "express";
import { respondWithError } from "./json.js";
import { AppError } from "./errors.js";

export function errorHandler(
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (err instanceof AppError) {
		respondWithError(res, err.statusCode, err.message);
	} else {
		console.error("Something went wrong on our end: ", err);
		respondWithError(res, 500, "Internal Server Error");
	}
}

// wraps async functions and returns a promise
// passing any errors to the errorhandler if necessary
export function asyncHandler(fn: RequestHandler) {
	return (req: Request, res: Response, next: NextFunction) => {
		return Promise.resolve(fn(req, res, next)).catch(next);
	};
}

// handler using curried arrow function
// export const fancy_asyncHandler =
// 	(fn: RequestHandler) =>
// 	(req: Request, res: Response, next: NextFunction) => {
// 		return Promise.resolve(fn(req, res, next)).catch(next);
// 	};
