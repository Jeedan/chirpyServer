import argon2 from "argon2";
import { Request } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UnauthorizedError } from "./api/errors.js";
import { randomBytes } from "node:crypto";
import { getUserFromRefreshToken } from "./db/queries/refreshToken.js";

export async function hashPassword(password: string): Promise<string> {
	const hash = await argon2.hash(password);
	return hash;
}

export async function checkPasswordHash(
	password: string,
	hash: string,
): Promise<boolean> {
	const match = await argon2.verify(hash, password);
	if (!match) return false;
	return true;
}

// iss is the issuer of the token. Set this to chirpy
// sub is the subject of the token, which is the user's ID.
// iat is the time the token was issued. Use Math.floor(Date.now() / 1000) to get the current time in seconds.
// exp is the time the token expires. Use iat + expiresIn to set the expiration
type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
	userID: string,
	expiresIn: number,
	secret: string,
): string {
	const issuedAt = Math.floor(Date.now() / 1000);
	const payload: payload = {
		iss: "chirpy",
		sub: userID,
		iat: issuedAt,
		exp: issuedAt + expiresIn,
	};
	const signed = jwt.sign(payload, secret);
	return signed;
}

export function validateJWT(tokenString: string, secret: string): string {
	try {
		const token = jwt.verify(tokenString, secret) as JwtPayload;
		const userID = token.sub;
		if (!userID) throw new UnauthorizedError("No userID in token");
		return userID;
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error(err.message);
			throw new UnauthorizedError(err.message);
		} else {
			console.error(err);
			throw new Error(`Could not validate JWT: ${err}`);
		}
	}
}

export function getBearerToken(req: Request): string {
	const bearerHeader = req.get("Authorization");
	return extractBearerToken(bearerHeader);
}

export function extractBearerToken(header: string | undefined): string {
	if (!header || !header.startsWith("Bearer "))
		throw new UnauthorizedError("No Authorization token found");
	const splitHeader = header.split(" ");
	if (splitHeader.length < 2)
		throw new UnauthorizedError("Invalid or Malformed Bearer Token");
	const token = splitHeader[1];
	if (!token) throw new UnauthorizedError("No Token found");
	return token;
}

export function makeRefreshToken(): string {
	return randomBytes(32).toString("hex");
}

export async function getUserIdFromRefreshToken(req: Request) {
	const bearerToken = getBearerToken(req);
	const refreshToken = await getUserFromRefreshToken(bearerToken);
	if (
		!refreshToken ||
		refreshToken.revokedAt ||
		refreshToken.expiresAt < new Date()
	)
		throw new UnauthorizedError("Invalid or Expired Refresh Token");

	return refreshToken.userId;
}
