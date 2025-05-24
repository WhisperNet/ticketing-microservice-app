import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@whispernet-sust/ticket-common';
import { Message } from 'node-nats-streaming';

const startUp = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const ticket = await Ticket.build({
    title: 'test',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: 'time',
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg };
};

it('sets the orderId for a order:created', async () => {
  const { listener, ticket, data, msg } = await startUp();
  await listener.onMessage(data, msg);
  const foundTicket = await Ticket.findById(ticket.id);
  expect(foundTicket!.orderId).toEqual(data.id);
});

it('publishes ticket updated event', async () => {
  const { listener, data, msg } = await startUp();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const passedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(passedData.orderId).toEqual(data.id);
});

it('acks the msg', async () => {
  const { listener, data, msg } = await startUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
