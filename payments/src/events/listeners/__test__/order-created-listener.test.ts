import { OrderCreatedEvent, OrderStatus } from '@whispernet-sust/ticket-common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrdeCreatedListener } from '../order-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

const startUp = () => {
  const listener = new OrdeCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: 'testdata',
    version: 0,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 101,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it('replicates newly created order', async () => {
  const { listener, data, msg } = startUp();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
  expect(order!.status).toEqual(OrderStatus.Created);
});

it('acks the message', async () => {
  const { listener, data, msg } = startUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
