import request from 'supertest';
import { app } from '../../app';
import { response } from 'express';
import { body } from 'express-validator';

it('returns details about the current signin user', async () => {
  const reqCookie = await global.signin();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', reqCookie)
    .send({})
    .expect(200);
  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('returns null if not signed in', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);
  expect(response.body.currentUser).toEqual(null);
});
