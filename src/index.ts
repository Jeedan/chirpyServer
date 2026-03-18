import express from "express";
import { Request, Response } from "express";

const app = express();
const PORT = 8080;

// serve static files from the /app/
app.use("/app", express.static("./src/app"));

// health check
app.get("healthz", handlerReadiness);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost: ${PORT}`);
});

function handlerReadiness(req: Request, res: Response) {
	//charset=utf-8
	res.set({ "Content-Type": "text/plain; charset=utf-8" });

	res.status(200).send("OK");
}
