import {
  Listener,
  Subjects,
  TicketUpdatedEvent,
} from '@whispernet-sust/ticket-common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const foundTicket = await Ticket.findByEvent(data);
    if (!foundTicket) throw new Error('Ticket not found');
    foundTicket.set({
      title: data.title,
      price: data.price,
    });
    await foundTicket.save();
    msg.ack();
  }
}
