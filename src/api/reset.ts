import { Request, Response } from "express";
import { config } from "../config.js";

export function handlerReset(req: Request, res: Response) {
	config.fileServerHits = 0;
	res.set({ "Content-Type": "text/plain; charset=utf-8" });
	res.status(200).send("Api Config metrics have been reset");
}
