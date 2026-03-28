import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
	const [result] = await db
		.insert(users)
		.values(user)
		.onConflictDoNothing()
		.returning();

	return result;
}

export async function getUserByEmail(email: string) {
	const [result] = await db
		.select()
		.from(users)
		.where(eq(users.email, email));

	return result;
}

export async function getUserById(id: string) {
	const [result] = await db.select().from(users).where(eq(users.id, id));

	return result;
}

export async function updateUserEmailAndPassword(
	id: string,
	email: string,
	hashedPassword: string,
) {
	const [result] = await db
		.update(users)
		.set({ email, hashedPassword })
		.where(eq(users.id, id))
		.returning();
	return result;
}

export async function updateUserIsChirpyRed(id: string, isChirpyRed: boolean) {
	const [result] = await db
		.update(users)
		.set({ isChirpyRed })
		.where(eq(users.id, id))
		.returning();
	return result;
}

export async function deleteUsers() {
	const result = await db.delete(users).returning();
	return result;
}
