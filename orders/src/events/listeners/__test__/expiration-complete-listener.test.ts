import {
  ExpirationCompleteEvent,
  OrderStatus,
  TicketCreatedEvent,
} from '@whispernet-sust/ticket-common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order } from '../../../models/order';

const startUp = async () => {
  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 100,
  });
  const order = await Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket: ticket,
  });
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};

it('sets the order status to cancel', async () => {
  const { listener, data, msg } = await startUp();
  await listener.onMessage(data, msg);
  const foundOrder = await Order.findById(data.orderId);
  expect(foundOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('publihses order cancel event', async () => {
  const { listener, data, msg, ticket } = await startUp();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const passedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(passedData.id).toEqual(data.orderId);
  expect(passedData.ticket.id).toEqual(ticket.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await startUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
