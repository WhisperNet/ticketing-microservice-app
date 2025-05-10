import request from 'supertest';
import { app } from '../../app';

const createTicket = async () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'Test', price: 10 })
    .expect(201);
};
it('returns all the listed ticket', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const res = await request(app).get('/api/tickets');
  expect(res.body.length).toEqual(3);
});
