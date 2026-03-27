import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "./errors.js";
import {
	createChirp,
	deleteChirpById,
	getAllChirps,
	getChirpById,
} from "../db/queries/chirps.js";
import { validateJWT, getBearerToken } from "../auth.js";
import { config } from "../config.js";

type BodyParams = {
	body: string;
};

export async function handlerCreateChirp(req: Request, res: Response) {
	const { body }: BodyParams = req.body;

	const userId = getUserIdFromToken(req);

	if (!body || body.length === 0) throw new BadRequestError("Empty Chirp");

	const cleanedBody = validateChirp(body);
	const chirp = await createChirp({ body: cleanedBody, userId });

	const payload = {
		id: chirp.id,
		createdAt: chirp.createdAt,
		updatedAt: chirp.updatedAt,
		body: cleanedBody,
		userId: chirp.userId,
	};

	respondWithJSON(res, 201, payload);
}

function getUserIdFromToken(req: Request): string {
	const token = getBearerToken(req);
	const userId = validateJWT(token, config.jwt.secret);
	if (!userId || userId.length === 0)
		throw new BadRequestError(`Invalid JWT`);

	return userId;
}

function validateChirp(body: string): string {
	const maxSize = 140;
	if (body.length > maxSize)
		throw new BadRequestError("Chirp is too long. Max length is 140");

	const words = body.split(" ");
	const profaneWords = ["kerfuffle", "sharbert", "fornax"];

	for (let i = 0; i < words.length; i++) {
		if (profaneWords.includes(words[i].toLowerCase())) {
			words[i] = "****";
		}
	}

	return words.join(" ");
}

export async function handlerGetAllChirps(req: Request, res: Response) {
	const chirps = await getAllChirps();
	if (chirps.length === 0)
		throw new NotFoundError("No Chirps found in Database");
	respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirp(req: Request, res: Response) {
	const { chirpId } = req.params;
	if (typeof chirpId !== "string")
		throw new BadRequestError("Invalid chirp ID");

	const chirp = await getChirpById(chirpId);
	if (!chirp) throw new NotFoundError(`No Chirp found with id: ${chirpId}`);
	respondWithJSON(res, 200, chirp);
}

export async function handlerDeleteChirp(req: Request, res: Response) {
	const { chirpId } = req.params;
	if (typeof chirpId !== "string")
		throw new BadRequestError("Invalid chirp ID");

	const accessToken = getBearerToken(req);
	const userId = validateJWT(accessToken, config.jwt.secret);

	const chirp = await getChirpById(chirpId);
	if (!chirp) throw new NotFoundError("Chirp not found.");

	if (!userId || userId !== chirp.userId)
		throw new ForbiddenError(`Forbidden to delete chirp`);

	const deleteChirp = await deleteChirpById(chirpId);
	if (!deleteChirp)
		throw new Error(`Something went wrong. Unable to delete chirp`);
	res.status(204).send();
}
