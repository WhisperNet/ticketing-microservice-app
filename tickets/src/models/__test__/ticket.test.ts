import mongoose from 'mongoose';
import { Ticket } from '../ticket';

it('has a implementation of optimistic concurency control', async () => {
  const ticket = await Ticket.build({
    userId: 'test',
    title: 'Test Ticket',
    price: 100,
  });
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({
    price: 10,
  });
  secondInstance!.set({
    price: 1000,
  });

  await firstInstance!.save();
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
});

it('increases the version number by one after each saves', async () => {
  const ticket = await Ticket.build({
    userId: 'test',
    title: 'Test Ticket',
    price: 100,
  });
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
