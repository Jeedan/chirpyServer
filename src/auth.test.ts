import { describe, it, expect, beforeAll } from "vitest";
import {
	checkPasswordHash,
	hashPassword,
	makeJWT,
	validateJWT,
	extractBearerToken,
} from "./auth.js";

describe("Password Hashing", () => {
	const password1 = "correctPassword123!";
	const password2 = "anotherPassword456!";
	let hash1: string;
	let hash2: string;

	beforeAll(async () => {
		hash1 = await hashPassword(password1);
		hash2 = await hashPassword(password2);
	});

	it("should return true for the correct password", async () => {
		const result = await checkPasswordHash(password1, hash1);
		expect(result).toBe(true);
	});
});

describe("JWT", () => {
	const secret = "123JWT";
	const userID = "b15e9dec-246f-44d6-86db-100cb8bc19c8";
	const signedToken = makeJWT(userID, 60, secret);
	const decodeJWT = validateJWT(signedToken, secret);

	it("should return true for a correctly signed JWT", async () => {
		expect(decodeJWT === userID).toBe(true);
	});

	it("should throw for a wrong secret JWT", async () => {
		expect(() => validateJWT(signedToken, "wrong_secret")).toThrow();
	});

	it("should throw for an expired JWT", async () => {
		expect(() => {
			const expiredToken = makeJWT(userID, 0, secret);
			validateJWT(expiredToken, secret);
		}).toThrow();
	});
});

describe("Get Bearer Token", () => {
	const token = extractBearerToken("Bearer token123");
	it("should return true if the token matches the Authorization header", async () => {
		expect(token).toBe("token123");
	});

	it("should throw when an empty string is passed as Header", async () => {
		expect(() => {
			const token = extractBearerToken("");
		}).toThrow();
	});

	it("should throw when missing the token in the Authorization header", async () => {
		expect(() => {
			const token = extractBearerToken("Bearer ");
		}).toThrow();
	});

	it("should throw when missing the Bearer part of the Authorization header", async () => {
		expect(() => {
			const token = extractBearerToken(" 123Token");
		}).toThrow();
	});
});
