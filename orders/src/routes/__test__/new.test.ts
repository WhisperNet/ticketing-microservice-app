import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { isIterationStatement } from 'typescript';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if ticket does not exist', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: new mongoose.Types.ObjectId() })
    .expect(404);
});

it('returns 400 if the ticket is already reserved', async () => {
  const ticket = await Ticket.build({
    title: 'Test tckt',
    price: 100,
  });
  await Order.build({
    userId: '3uye9qw8ry3989y',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('creats an order if the ticket is available', async () => {
  const ticket = await Ticket.build({
    title: 'Test tckt',
    price: 100,
  });
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('Emits a created order event', async () => {
  const ticket = await Ticket.build({
    title: 'Test tckt',
    price: 100,
  });
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
