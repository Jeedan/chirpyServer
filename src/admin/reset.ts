import { Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "../api/errors.js";
import { deleteUsers } from "../db/queries/users.js";

export async function handlerReset(req: Request, res: Response) {
	if (config.platform !== "dev")
		throw new ForbiddenError("Forbidden to reset metrics");

	config.fileServerHits = 0;

	const users = await deleteUsers();

	res.set({ "Content-Type": "text/plain; charset=utf-8" });
	res.status(200).send("Api Config metrics have been reset.\n");
}
