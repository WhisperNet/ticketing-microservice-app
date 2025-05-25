import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@whispernet-sust/ticket-common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
