import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { createChirp, getAllChirps } from "../db/queries/chirps.js";

type parameters = {
	body: string;
	userId: string;
};

export async function handlerCreateChirp(req: Request, res: Response) {
	const params: parameters = req.body;
	const { body, userId } = params;

	if (!body || body.length === 0) throw new BadRequestError("Empty Chirp");
	if (!userId || userId.length === 0)
		throw new BadRequestError(`Invalid user_id`);

	const cleanedBody = validateChirp(params);
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

function validateChirp(params: parameters): string {
	const maxSize = 140;

	const body = params.body;
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
