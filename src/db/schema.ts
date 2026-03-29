import {
	pgTable,
	timestamp,
	varchar,
	uuid,
	text,
	boolean,
} from "drizzle-orm/pg-core";

// users
export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	email: varchar("email", { length: 256 }).notNull().unique(),
	hashedPassword: varchar("hashed_password", { length: 256 })
		.notNull()
		.default("unset"),
	isChirpyRed: boolean("is_chirpy_red").default(false).notNull(),
});

export type NewUser = typeof users.$inferInsert;

// chirps
export const chirps = pgTable("chirps", {
	id: uuid("id").defaultRandom().primaryKey(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	body: text("body").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export type NewChirp = typeof chirps.$inferInsert;
export type Chirp = typeof chirps.$inferSelect;

// refresh_tokens
export const refreshTokens = pgTable("refresh_tokens", {
	token: varchar("token", { length: 256 }).primaryKey(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date()),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at").notNull(),
	revokedAt: timestamp("revoked_at"),
});

export type NewRefreshToken = typeof refreshTokens.$inferInsert;
