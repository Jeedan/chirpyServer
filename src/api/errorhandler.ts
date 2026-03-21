import { NextFunction, Request, RequestHandler, Response } from "express";
import { respondWithError } from "./json.js";

export function errorHandler(
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	console.error("Something went wrong on our end");
	respondWithError(res, 500, "Something went wrong on our end");
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
