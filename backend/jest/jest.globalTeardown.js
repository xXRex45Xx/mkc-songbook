let mongoMemoryServer;

export default async () => {
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
