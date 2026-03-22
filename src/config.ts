import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

type APIConfig = {
	fileServerHits: number;
	db: DBConfig;
};

type DBConfig = {
	migrationConfig: MigrationConfig;
	url: string;
};

function envOrThrow(key: string) {
	const value = process.env[key];
	if (!value || value.length === 0)
		throw new Error(`Environment variable ${key} is not set`);

	return value;
}

const migrationConfig: MigrationConfig = {
	migrationsFolder: "./src/db/out",
};

const dbConfig: DBConfig = {
	migrationConfig: migrationConfig,
	url: envOrThrow("DB_URL"),
};

export const config: APIConfig = {
	fileServerHits: 0,
	db: dbConfig,
};
