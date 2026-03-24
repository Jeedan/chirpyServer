import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { hashPassword } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { createUser } from "../db/queries/users.js";

type parameters = {
	email: string;
	password: string;
};

type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response) {
	const { email, password }: parameters = req.body;

	const hashedPassword = await hashPassword(password);

	if (!hashedPassword) throw new BadRequestError("Invalid password");

	if (!email || email.length === 0)
		throw new BadRequestError("No email provided to create a user");

	const user = await createUser({ email, hashedPassword });
	if (!user) throw new Error("Could not create user");

	const payload: UserResponse = {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};

	respondWithJSON(res, 201, payload);
}
