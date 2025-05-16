import {
  OrderUpdatedEvent,
  Publisher,
  Subjects,
} from '@whispernet-sust/ticket-common';

export class OrderCancelledPublisher extends Publisher<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderCancelled;
}
