import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@whispernet-sust/ticket-common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
