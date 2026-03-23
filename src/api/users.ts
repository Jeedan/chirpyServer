import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";

type parameters = {
	email: string;
};

export async function handlerCreateUser(req: Request, res: Response) {
	const params: parameters = req.body;
	const { email } = params;

	if (!email || email.length === 0)
		throw new BadRequestError("No email provided to create a user");

	const user = await createUser({ email: email });
	if (!user) throw new Error("Could not create user");

	const payload = {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};

	respondWithJSON(res, 201, payload);
}
