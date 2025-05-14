import {
  Subjects,
  TicketUpdatedEvent,
  Publisher,
} from '@whispernet-sust/ticket-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
