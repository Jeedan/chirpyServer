import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export async function saveRefreshToken(token: NewRefreshToken) {
	const [result] = await db.insert(refreshTokens).values(token).returning();
	return result;
}

export async function getUserForRefreshToken(token: string) {
	const [result] = await db
		.select({
			token: refreshTokens.token,
			userId: refreshTokens.userId,
			expiresAt: refreshTokens.expiresAt,
			revokedAt: refreshTokens.revokedAt,
		})
		.from(refreshTokens)
		.where(eq(refreshTokens.token, token));

	return result;
}

export async function revokeRefreshToken(token: string) {
	await db
		.update(refreshTokens)
		.set({ revokedAt: new Date(), updatedAt: new Date() })
		.where(eq(refreshTokens.token, token));
}
