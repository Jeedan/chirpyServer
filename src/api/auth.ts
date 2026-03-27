import { Request, Response } from "express";
import { UnauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getUserByEmail } from "../db/queries/users.js";
import { NewUser, NewRefreshToken } from "../db/schema.js";
import {
	checkPasswordHash,
	getBearerToken,
	getUserIdFromRefreshToken,
	makeJWT,
	makeRefreshToken,
} from "../auth.js";
import { config } from "../config.js";
import {
	revokeRefreshToken,
	saveRefreshToken,
} from "../db/queries/refreshToken.js";

type parameters = {
	email: string;
	password: string;
	//expiresInSeconds?: number;
};

type UserResponse = Omit<NewUser, "hashedPassword">;
type TokenResponse = {
	token: string;
	refreshToken: string;
};
type PayloadResponse = UserResponse & TokenResponse;

const oneHourInSeconds = 60 * 60;
const sixtyDays = 60 * 60 * 24 * 60 * 1000;

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
	const accessToken = makeJWT(user.id, oneHourInSeconds, config.jwtSecret);
	const refreshToken: NewRefreshToken = {
		token: makeRefreshToken(),
		userId: user.id,
		expiresAt: new Date(Date.now() + sixtyDays),
		revokedAt: null,
	};

	const saveToken = await saveRefreshToken(refreshToken);
	if (!saveToken) throw new Error(`Could not save token`);

	const payload: PayloadResponse = {
		id: user.id,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		email: user.email,
		token: accessToken,
		refreshToken: refreshToken.token,
	};
	respondWithJSON(res, 200, payload);
}

export async function handlerRefreshToken(req: Request, res: Response) {
	const userId = await getUserIdFromRefreshToken(req);
	const accessToken = makeJWT(userId, oneHourInSeconds, config.jwtSecret);
	respondWithJSON(res, 200, { token: accessToken });
}

export async function handlerRevokeToken(req: Request, res: Response) {
	const refreshToken = getBearerToken(req);
	await revokeRefreshToken(refreshToken);
	res.status(204).send();
}
