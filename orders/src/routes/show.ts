import {
  NotAuthorizeError,
  NotFoundError,
  requireAuth,
} from '@whispernet-sust/ticket-common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const foundOrder = await Order.findById(req.params.orderId);
    if (!foundOrder) throw new NotFoundError();
    if (foundOrder.userId !== req.currentUser!.id)
      throw new NotAuthorizeError();
    res.status(200).send(foundOrder);
  }
);

export { router as showOrderRouter };
