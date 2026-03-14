import { MongoMemoryServer } from "mongodb-memory-server";

let mongoMemoryServer;

export default async () => {
	// Start in-memory MongoDB
	mongoMemoryServer = await MongoMemoryServer.create();
	const uri = mongoMemoryServer.getUri();

	// Set environment variable for test connection
	process.env.DB_URI = uri;
};
