import express from 'express';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  setCurrentUser,
} from '@whispernet-sust/ticket-common';
import { newTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes';
import { updateTicketRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != 'test',
  })
);
app.use(setCurrentUser);
app.use(showTicketRouter);
app.use(newTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);
app.all('*splat', (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
