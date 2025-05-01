import request from 'supertest';
import { app } from '../../app';

it('response with cookies if given correct creds', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
it('fails when either incorrect email or passowrd is suplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'notcreated@test.com',
      password: 'test',
    })
    .expect(400);
  await global.signin();
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'Incorrect',
    })
    .expect(400);
});
