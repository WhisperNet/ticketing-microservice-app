import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns 404 if the ticket is not found', async () => {
  const randomID = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${randomID}`).expect(404);
});

it('returns the ticket after finding it', async () => {
  const title = 'test';
  const price = 10;
  let res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);
  res = await request(app).get(`/api/tickets/${res.body.id}`).expect(200);
  expect(res.body.title).toEqual(title);
  expect(res.body.price).toEqual(price);
});
