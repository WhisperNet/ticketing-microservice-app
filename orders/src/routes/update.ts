import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import {
  NotAuthorizeError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from '@whispernet-sust/ticket-common';
const router = express.Router();

router.patch(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const foundOrder = await Order.findById(req.params.orderId);
    if (!foundOrder) throw new NotFoundError();
    if (foundOrder.userId !== req.currentUser.id) throw new NotAuthorizeError();
    foundOrder.status = OrderStatus.Cancelled;
    await foundOrder.save();
    res.status(200).send(foundOrder);
  }
);

export { router as updateOrderRouter };
