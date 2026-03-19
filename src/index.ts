import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import {
	middlewareLogResponses,
	middlewareMetricsInc,
} from "./api/middleware.js";

const app = express();
const PORT = 8080;

// middleware
// serve static files from the /app/
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);
// health check
app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
