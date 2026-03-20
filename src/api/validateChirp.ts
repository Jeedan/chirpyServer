import { Request, Response } from "express";

export function handlerValidateChirp(req: Request, res: Response) {
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
