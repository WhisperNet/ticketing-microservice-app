import request from 'supertest';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@whispernet-sust/ticket-common';
import { app } from '../../app';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';

const startUp = async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = await Order.build({
    id: orderId,
    version: 0,
    price: Math.floor(Math.random() * 1000) + 1,
    userId,
    status: OrderStatus.Created,
  });
  return { orderId, userId, order };
};

it('returns 401 for unauthorized access', async () => {
  const { orderId, userId, order } = await startUp();
  await request(app)
    .post('/api/payment')
    .set('Cookie', global.signin())
    .send({
      orderId,
      token: 'tok_visa',
    })
    .expect(401);
});

it('returns 400 for cancelled order', async () => {
  const { orderId, userId, order } = await startUp();
  order.status = OrderStatus.Cancelled;
  await order.save();
  await request(app)
    .post('/api/payment')
    .set('Cookie', global.signin(userId))
    .send({
      orderId,
      token: 'tok_visa',
    })
    .expect(400);
});

it('returns 201 for valid inputs', async () => {
  const { orderId, userId, order } = await startUp();
  await request(app)
    .post('/api/payment')
    .set('Cookie', global.signin(userId))
    .send({
      orderId,
      token: 'tok_visa',
    })
    .expect(201);
}, 10000);

it('charges the card and creats a payment', async () => {
  const { orderId, userId, order } = await startUp();
  await request(app)
    .post('/api/payment')
    .set('Cookie', global.signin(userId))
    .send({
      orderId,
      token: 'tok_visa',
    })
    .expect(201);

  const charges = await stripe.charges.list({ limit: 5 });
  const charge = charges.data.find(
    (charge) => charge.amount === order.price * 100
  );
  expect(charge).toBeDefined();
  expect(charge!.currency).toEqual('usd');

  const foundPayment = await Payment.findOne({
    orderId,
  });
  expect(foundPayment).not.toBeNull();
}, 10000);

it('publishes an event', async () => {
  const { orderId, userId, order } = await startUp();
  await request(app)
    .post('/api/payment')
    .set('Cookie', global.signin(userId))
    .send({
      orderId,
      token: 'tok_visa',
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
}, 10000);
