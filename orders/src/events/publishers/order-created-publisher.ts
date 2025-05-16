import {
  OrderCreatedEvent,
  Publisher,
  Subjects,
} from '@whispernet-sust/ticket-common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
