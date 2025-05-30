import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import nats from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listerner';
const startUp = async () => {
  try {
    if (!process.env.JWT_KEY) throw Error('JWT Environment variable not found');
    if (!process.env.MONGO_URI)
      throw new Error('MONGO_URI Environment variable not found');
    if (
      !process.env.NATS_CLIENT_ID ||
      !process.env.NATS_CLUSTER_ID ||
      !process.env.NATS_URL
    )
      throw new Error('NATS environment varialble not foun');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected');
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log(
        'Nats cleint is shutting down\nReason:Cleint connection has been closed'
      );
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    app.listen(3000, (err) => {
      console.log('Orders Servise is listening on port 3000!');
    });
  } catch (err) {
    console.log('Something went wrong while starting the app');
    console.log(err);
  }
};

startUp();
