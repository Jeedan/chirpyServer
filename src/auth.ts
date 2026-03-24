import argon2 from "argon2";

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
