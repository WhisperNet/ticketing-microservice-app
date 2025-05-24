import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';
const startUp = async () => {
  try {
    if (!process.env.REDIS_HOST) throw new Error('REDIS_HOST is not defiend');
    if (
      !process.env.NATS_CLIENT_ID ||
      !process.env.NATS_CLUSTER_ID ||
      !process.env.NATS_URL
    )
      throw new Error('NATS environment varialble not foun');
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
    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.log('Something went wrong while starting the app');
    console.log(err);
  }
};

startUp();
