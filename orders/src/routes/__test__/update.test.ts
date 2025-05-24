import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@whispernet-sust/ticket-common';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('retruns 401 for unauthorized user', async () => {
  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test ticket',
    price: 100,
  });
  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: canceledOrder } = await request(app)
    .patch(`/api/orders/${createdOrder.id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(401);
});

it('cancels the order for an authorized user request', async () => {
  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test ticket',
    price: 100,
  });
  const user = global.signin();
  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: canceledOrder } = await request(app)
    .patch(`/api/orders/${createdOrder.id}`)
    .set('Cookie', user)
    .send({})
    .expect(200);
  expect(canceledOrder.status).toEqual(OrderStatus.Cancelled);
});

it('Emits a cancelled order event', async () => {
  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test ticket',
    price: 100,
  });
  const user = global.signin();
  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: canceledOrder } = await request(app)
    .patch(`/api/orders/${createdOrder.id}`)
    .set('Cookie', user)
    .send({})
    .expect(200);
  expect(canceledOrder.status).toEqual(OrderStatus.Cancelled);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
