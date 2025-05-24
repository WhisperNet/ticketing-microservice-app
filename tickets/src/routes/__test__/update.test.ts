import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns 404 if the ticket does not exits', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'TEST', price: 10 })
    .expect(404);
});

it('returns 401 for unauthenticated access', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'test', price: 10 })
    .expect(401);
});

it('returns 401 for unauthorized access', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'test', price: 10 });
  expect(201);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'test', price: 10 })
    .expect(401);
});

it('returns 400 for invalid requests', async () => {
  const cookie = global.signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 10 });
  expect(201);
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 10 })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'test', price: -10 })
    .expect(400);
});

it('updates the content for valid authorized request', async () => {
  const cookie = global.signin();
  let res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 10 });
  expect(201);
  res = await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'updated', price: 100 })
    .expect(200);

  expect(res.body.title).toEqual('updated');
  expect(res.body.price).toEqual(100);
});

it('invokes publisher for a ticket updated event', async () => {
  const cookie = global.signin();
  let res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 10 });
  expect(201);
  res = await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'updated', price: 100 })
    .expect(200);

  expect(res.body.title).toEqual('updated');
  expect(res.body.price).toEqual(100);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('throws 400 for booked ticket', async () => {
  const cookie = global.signin();
  let res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'test', price: 10 });
  expect(201);
  const createdticket = await Ticket.findById(res.body.id);
  createdticket?.set({
    orderId: new mongoose.Types.ObjectId().toHexString(),
  });
  await createdticket!.save();
  res = await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'updated', price: 100 })
    .expect(400);
});
