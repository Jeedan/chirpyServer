import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./admin/metrics.js";
import { handlerReset } from "./admin/reset.js";
import {
	middlewareLogResponses,
	middlewareMetricsInc,
} from "./api/middleware.js";
import { asyncHandler, errorHandler } from "./api/errorhandler.js";
import {
	handlerCreateChirp,
	handlerDeleteChirp,
	handlerGetAllChirps,
	handlerGetChirp,
} from "./api/chirps.js";
import { handlerCreateUser, handlerUpdateUser } from "./api/users.js";
import {
	handlerLogin,
	handlerRefreshToken,
	handlerRevokeToken,
} from "./api/auth.js";
import { handlerUpgradeUser } from "./api/webhooks.js";

const app = express();
const PORT = 8080;

// built in JSON body parsing middleware
app.use(express.json());
// middleware
app.use(middlewareLogResponses);
// serve static files from the /app/
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

// admin routes
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", asyncHandler(handlerReset));

// api routes
// chirps
app.post("/api/chirps", asyncHandler(handlerCreateChirp));
app.get("/api/chirps", asyncHandler(handlerGetAllChirps));
app.get("/api/chirps/:chirpId", asyncHandler(handlerGetChirp));
app.delete("/api/chirps/:chirpId", asyncHandler(handlerDeleteChirp));

// users
app.post("/api/users", asyncHandler(handlerCreateUser));
app.put("/api/users", asyncHandler(handlerUpdateUser));

// login
app.post("/api/login", asyncHandler(handlerLogin));
app.post("/api/refresh", asyncHandler(handlerRefreshToken));
app.post("/api/revoke", asyncHandler(handlerRevokeToken));

// webhook
app.post("/api/polka/webhooks", asyncHandler(handlerUpgradeUser));

// health check
app.get("/api/healthz", handlerReadiness);

//error handling middleware last to catch all errors
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});
