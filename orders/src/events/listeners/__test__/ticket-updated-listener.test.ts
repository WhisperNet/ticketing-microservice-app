import {
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from '@whispernet-sust/ticket-common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const startUp = async () => {
  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 100,
  });
  const listener = new TicketUpdatedListener(natsWrapper.client);
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: 'test ticket was updated',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};

it('finds,updates and saves the ticket', async () => {
  const { listener, data, msg, ticket } = await startUp();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.version).toEqual(data.version);
  expect(updatedTicket!.title).toEqual(data.title);
});

it('acks the event after a successful handling', async () => {
  const { listener, data, msg } = await startUp();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('does not ack  out of order events', async () => {
  const { listener, data, msg } = await startUp();
  data.version = 100;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
