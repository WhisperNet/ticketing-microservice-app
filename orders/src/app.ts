import express from 'express';
import cookieSession from 'cookie-session';
import {
  errorHandler,
  NotFoundError,
  setCurrentUser,
} from '@whispernet-sust/ticket-common';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes';
import { updateOrderRouter } from './routes/update';

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
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(updateOrderRouter);
app.all('*splat', (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
