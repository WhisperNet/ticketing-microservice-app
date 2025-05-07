import request from 'supertest';
import { app } from '../../app';

it('returns 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'test',
    })
    .expect(201);
});

it('returns 400 with invalid email or password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test',
      password: 'test',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 't',
    })
    .expect(400);
});
it('returns 400 for missing email or password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: '',
      password: 'test',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: '',
    })
    .expect(400);
});
it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'test',
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});
it('Rejects duplicate email', async () => {
  await global.signin();
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'test',
    })
    .expect(400);
});
