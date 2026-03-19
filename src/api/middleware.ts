import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

export function middlewareLogResponses(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	res.on("finish", () => {
		const method = req.method;
		const url = req.url;
		const statusCode = res.statusCode;

		if (!statusCode || statusCode !== 200) {
			console.log(
				`[NON-OK] ${method} ${url} - Status: ${res.statusCode}`,
			);
		}
	});
	next();
}

export function middlewareMetricsInc(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	config.fileServerHits += 1;
	next();
}
