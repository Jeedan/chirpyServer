import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";

type parameters = {
	body: string;
};

export async function handlerValidateChirp(
	req: Request,
	res: Response,
): Promise<void> {
	// TODO move into .env
	const maxSize = 140;

	const params: parameters = req.body;
	if (params.body.length > maxSize) throw new Error("Chirp is too long");

	const words = params.body.split(" ");
	const profaneWords = ["kerfuffle", "sharbert", "fornax"];

	for (let i = 0; i < words.length; i++) {
		if (profaneWords.includes(words[i].toLowerCase())) {
			words[i] = "****";
		}
	}

	const body = words.join(" ");
	respondWithJSON(res, 200, body);
}

export function handlerManuallyValidateChirp(req: Request, res: Response) {
	let body = "";
	const maxSize = 140;
	console.log(`hello from validateChirp start`);

	type responseData = {
		body: string;
	};

	req.on("data", (chunk) => {
		body += chunk;
	});

	req.on("end", () => {
		try {
			const parsedBody: responseData = JSON.parse(body);

			if (parsedBody.body.length > maxSize)
				throw new Error("Chirp is too long");
			res.header("Content-Type", "application/json");
			const respBody = JSON.stringify(parsedBody.body);
			console.log(`respBody: ${respBody}`);
			res.status(200).send({ valid: true });
		} catch (err: unknown) {
			if (err instanceof Error) {
				res.status(400).send({ error: err.message });
				return;
			}
			res.status(400).send({ error: "Something went wrong" });
		}
	});
}
