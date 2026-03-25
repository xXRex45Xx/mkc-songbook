import mongoose from 'mongoose';

export const clearDatabase = async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const collection of collections) {
    await mongoose.connection.collection(collection.name).deleteMany({});
  }
};

export const dropCollections = async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const collection of collections) {
    await mongoose.connection.db.dropCollection(collection.name);
  }
};

export const closeDatabase = async () => {
  await mongoose.connection.close();
};
