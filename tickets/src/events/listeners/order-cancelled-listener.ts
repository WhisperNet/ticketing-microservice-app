import {
  Listener,
  OrderUpdatedEvent,
  Subjects,
} from '@whispernet-sust/ticket-common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderUpdatedEvent['data'], msg: Message) {
    const foundTicket = await Ticket.findById(data.ticket.id);
    if (!foundTicket) throw new Error('Unable to found the ticket');
    foundTicket.set({
      orderId: undefined,
    });
    await foundTicket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: foundTicket.id,
      title: foundTicket.title,
      price: foundTicket.price,
      userId: foundTicket.userId,
      version: foundTicket.version,
      orderId: foundTicket.orderId,
    });
    msg.ack();
  }
}
