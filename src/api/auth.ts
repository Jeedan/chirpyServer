import { Request, Response } from "express";
import { UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getUserByEmail } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { config } from "../config.js";

type parameters = {
	email: string;
	password: string;
	expiresInSeconds?: number;
};

type UserResponse = Omit<NewUser, "hashedPassword">;

const oneHourInSeconds = 60 * 60;

export async function handlerLogin(req: Request, res: Response) {
	const { email, password }: parameters = req.body;

	let { expiresInSeconds }: parameters = req.body;

	if (!expiresInSeconds || expiresInSeconds > oneHourInSeconds)
		expiresInSeconds = oneHourInSeconds;

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

	const token = makeJWT(user.id, expiresInSeconds, config.jwtSecret);

	const payload = {
		id: user.id,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		email: user.email,
		token: token,
	};
	respondWithJSON(res, 200, payload);
}
