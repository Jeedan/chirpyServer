import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./admin/metrics.js";
import { handlerReset } from "./admin/reset.js";
import {
	middlewareLogResponses,
	middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerValidateChirp } from "./api/validateChirp.js";

const app = express();
const PORT = 8080;

// middleware
app.use(middlewareLogResponses);
// serve static files from the /app/
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

// admin
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

// api
app.post("/api/validate_chirp", handlerValidateChirp);

// health check
app.get("/api/healthz", handlerReadiness);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
