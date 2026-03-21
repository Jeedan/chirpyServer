import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./admin/metrics.js";
import { handlerReset } from "./admin/reset.js";
import {
	middlewareLogResponses,
	middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerValidateChirp } from "./api/validateChirp.js";
import { asyncHandler, errorHandler } from "./api/errorhandler.js";

const app = express();
const PORT = 8080;

// built in JSON body parsing middleware
app.use(express.json());
// middleware
app.use(middlewareLogResponses);
// serve static files from the /app/
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

// admin
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

// api
app.post("/api/validate_chirp", asyncHandler(handlerValidateChirp));

// health check
app.get("/api/healthz", handlerReadiness);

//error handling middleware last to catch all errors
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
