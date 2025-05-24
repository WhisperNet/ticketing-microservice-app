import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import {
  OrderCreatedEvent,
  OrderStatus,
  OrderUpdatedEvent,
} from '@whispernet-sust/ticket-common';
import { Message } from 'node-nats-streaming';

const startUp = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = await Ticket.build({
    title: 'test',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.orderId = orderId;
  const data: OrderUpdatedEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg, orderId };
};

it('removes the orderId for a order:cancelled', async () => {
  const { listener, ticket, data, msg } = await startUp();
  await listener.onMessage(data, msg);
  const foundTicket = await Ticket.findById(ticket.id);
  expect(foundTicket!.orderId).not.toBeDefined();
});

it('publishes ticket updated event', async () => {
  const { listener, data, msg, ticket } = await startUp();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const passedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(passedData.id).toEqual(ticket.id);
});

it('acks the msg', async () => {
  const { listener, data, msg } = await startUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
