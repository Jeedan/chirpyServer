import { Request, Response } from "express";
import { UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getUserByEmail } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { checkPasswordHash } from "../auth.js";

type parameters = {
	email: string;
	password: string;
};

type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerLogin(req: Request, res: Response) {
	const { email, password }: parameters = req.body;

	const user = await getUserByEmail(email);
	if (!user)
		throw new UnauthorizedError(
			`Unauthorized Access: incorrect Email or Password`,
		);

	const match = await checkPasswordHash(password, user.hashedPassword);
	if (!match)
		throw new UnauthorizedError(
			`Unauthorized Access: incorrect Email or Password`,
		);

	const payload: UserResponse = {
		id: user.id,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		email: user.email,
	};
	respondWithJSON(res, 200, payload);
}
