import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import {
  NotAuthorizeError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from '@whispernet-sust/ticket-common';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

router.patch(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const foundOrder = await Order.findById(req.params.orderId).populate(
      'ticket'
    );
    if (!foundOrder) throw new NotFoundError();
    if (foundOrder.userId !== req.currentUser.id) throw new NotAuthorizeError();
    foundOrder.status = OrderStatus.Cancelled;
    await foundOrder.save();
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: foundOrder.id,
      version: foundOrder.version,
      ticket: {
        id: foundOrder.ticket.id,
      },
    });
    res.status(200).send(foundOrder);
  }
);

export { router as updateOrderRouter };
