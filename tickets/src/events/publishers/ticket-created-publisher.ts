import {
  Subjects,
  Publisher,
  TicketCreatedEvent,
} from '@whispernet-sust/ticket-common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TciketCreated;
}
