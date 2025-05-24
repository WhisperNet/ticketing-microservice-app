import {
  Listener,
  OrderCreatedEvent,
  Subjects,
  TicketUpdatedEvent,
} from '@whispernet-sust/ticket-common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const foundticket = await Ticket.findById(data.ticket.id);
    if (!foundticket) throw new Error('ticket not found');
    foundticket.set({
      orderId: data.id,
    });
    await foundticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: foundticket.id,
      title: foundticket.title,
      price: foundticket.price,
      userId: foundticket.userId,
      version: foundticket.version,
      orderId: foundticket.orderId,
    } as TicketUpdatedEvent['data']);
    msg.ack();
  }
}
