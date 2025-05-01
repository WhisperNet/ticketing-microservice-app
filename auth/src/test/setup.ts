import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
  var signin: () => Promise<string[]>;
}
global.signin = async () => {
  const email = 'test@test.com';
  const password = 'test';
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
    })
    .expect(201);
  const cookie = response.get('Set-Cookie');

  if (!cookie) throw new Error('Failed to get cookie');
  return cookie;
};

let mongodb: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'test_environemnt_key';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  mongodb = await MongoMemoryServer.create();
  const mongoUri = mongodb.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongodb) await mongodb.stop();
  await mongoose.connection.close();
});
