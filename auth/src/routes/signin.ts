import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
const router = express.Router();

router.post('/api/users/signin', (req: Request, res: Response) => {
  res.status(200).send({});
});

export { router as signinRouter };
