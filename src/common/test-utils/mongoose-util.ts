import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongo = new MongoMemoryServer();
      const mongoUri = await mongo.getUri();
      return {
        uri: mongoUri,
        ...options
      };
    }
  });

export const closeInMongoConnection = async () => {
  if (mongo) await mongo.stop();
};
