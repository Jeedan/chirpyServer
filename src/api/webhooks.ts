import { Request, Response } from "express";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./errors.js";
import { NewUser } from "../db/schema.js";
import { updateUserIsChirpyRed } from "../db/queries/users.js";
import { getApiKey } from "../auth.js";
import { config } from "../config.js";

// Request shape
// {
//   "event": "user.upgraded",
//   "data": {
//     "userId": "3311741c-680c-4546-99f3-fc9efac2036c"
//   }
// }
type BodyParams = {
	event: string;
	data: {
		userId: string;
	};
};

type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerUpgradeUser(req: Request, res: Response) {
	const apiKey = getApiKey(req);

	if (apiKey !== config.polkaAPIKey)
		throw new UnauthorizedError("Invalid API key");

	const { event, data }: BodyParams = req.body;

	if (event !== "user.upgraded") return res.status(204).send();

	if (!data || !data.userId)
		throw new BadRequestError("data.userId is required");
	const { userId } = data;

	const upgradeUserChirpyRed: UserResponse = await updateUserIsChirpyRed(
		userId,
		true,
	);
	if (!upgradeUserChirpyRed)
		throw new NotFoundError("User could not be found");

	return res.status(204).send();
}
