import {
  Listener,
  OrderStatus,
  OrderUpdatedEvent,
  Subjects,
} from '@whispernet-sust/ticket-common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelListener extends Listener<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName: string = queueGroupName;
  async onMessage(data: OrderUpdatedEvent['data'], msg: Message) {
    const updatedOrder = await Order.findByIdAndUpdate(
      data.id,
      { status: OrderStatus.Cancelled },
      { new: true }
    );
    if (!updatedOrder) throw new Error('Unable to find the order to cancel');
    msg.ack();
  }
}
