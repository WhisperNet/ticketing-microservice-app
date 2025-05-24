import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  Subjects,
} from '@whispernet-sust/ticket-common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;
  async onMessage(data: { orderId: string }, msg: Message) {
    const foundOrder = await Order.findById({ _id: data.orderId }).populate(
      'ticket'
    );
    if (!foundOrder) throw new Error('Order on found');
    foundOrder.set({
      status: OrderStatus.Cancelled,
    });
    await foundOrder.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: foundOrder.id,
      version: foundOrder.version,
      ticket: {
        id: foundOrder.ticket.id,
      },
    });
    msg.ack();
  }
}
