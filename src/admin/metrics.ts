import { Request, Response } from "express";
import { config } from "../config.js";

export function handlerMetrics(req: Request, res: Response) {
	const html = `<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileServerHits} times!</p>
  </body>
</html>`;
	res.set({ "Content-Type": "text/html; charset=utf-8" });
	res.status(200).send(html);
}
