import { Subjects } from '@whispernet-sust/ticket-common';

export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: Subjects, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
