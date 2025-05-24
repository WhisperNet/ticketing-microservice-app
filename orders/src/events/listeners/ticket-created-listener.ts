import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from '@whispernet-sust/ticket-common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TciketCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    await Ticket.build({
      id,
      title,
      price,
    });
    msg.ack();
  }
}
