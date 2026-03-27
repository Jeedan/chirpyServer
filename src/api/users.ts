import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { createUser, updateUserEmailAndPassword } from "../db/queries/users.js";
import { config } from "../config.js";

type parameters = {
	email: string;
	password: string;
};

type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response) {
	const { email, password }: parameters = req.body;

	if (!password || password.length === 0)
		throw new BadRequestError("No password provided to update");

	const hashedPassword = await hashPassword(password);

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

export async function handlerUpdateUser(req: Request, res: Response) {
	const { email, password }: parameters = req.body;
	const accessToken = getBearerToken(req);
	const userId = validateJWT(accessToken, config.jwt.secret);

	if (!email || email.length === 0)
		throw new BadRequestError("No email provided to update");

	if (!password || password.length === 0)
		throw new BadRequestError("No password provided to update");

	const hashedPassword = await hashPassword(password);

	const updatedUser = await updateUserEmailAndPassword(
		userId,
		email,
		hashedPassword,
	);

	if (!updatedUser) throw new Error("Could not update user");

	const payload: UserResponse = {
		id: updatedUser.id,
		email: updatedUser.email,
		createdAt: updatedUser.createdAt,
		updatedAt: updatedUser.updatedAt,
	};

	respondWithJSON(res, 200, payload);
}
