import { Request, Response } from "express";

export function handlerReadiness(req: Request, res: Response) {
	//charset=utf-8
	res.set({ "Content-Type": "text/plain; charset=utf-8" });

	res.status(200).send("OK");
}
