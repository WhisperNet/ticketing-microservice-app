import {
  OrderCreatedEvent,
  OrderStatus,
  OrderUpdatedEvent,
} from '@whispernet-sust/ticket-common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrdeCreatedListener } from '../order-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';
import { OrderCancelListener } from '../order-cancel-listener';

const startUp = async () => {
  const listener = new OrderCancelListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const order = await Order.build({
    id: orderId,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 101,
    status: OrderStatus.Created,
  });

  const data: OrderUpdatedEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order };
};

it('sets the order staus to cancel', async () => {
  const { listener, data, msg, order } = await startUp();
  await listener.onMessage(data, msg);
  const foundOrder = await Order.findById(order.id);
  expect(foundOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the msg', async () => {
  const { listener, data, msg, order } = await startUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
