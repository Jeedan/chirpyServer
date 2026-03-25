import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

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
		if (!userID) throw new Error("No userID in token");
		console.log(userID);
		return userID;
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error(err.message);
			throw new Error(err.message);
		} else {
			console.error(err);
			throw new Error(`Could not validate JWT: ${err}`);
		}
	}
}
