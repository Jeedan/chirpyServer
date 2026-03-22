process.loadEnvFile();

type APIConfig = {
	fileServerHits: number;
	dbURL: string;
};

function envOrThrow(key: string) {
	const value = process.env[key];
	if (!value || value.length === 0)
		throw new Error(`Environment variable ${key} is not set`);

	return value;
}

export const config: APIConfig = {
	fileServerHits: 0,
	dbURL: envOrThrow("DB_URL"),
};
