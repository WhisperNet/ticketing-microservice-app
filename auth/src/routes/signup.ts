import express, { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { User } from '../models/User';
import { body } from 'express-validator';
import { BadRequestError } from '../errors/bad-request-error';
import { requestValidationHandler } from '../middlewares/request-validation-handler';
const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 char long'),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    if (foundUser) throw new BadRequestError('Email already exists');
    const user = await User.build({ email, password });
    const jsonToekn = JWT.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );
    req.session = {
      JWT: jsonToekn,
    };
    res.status(201).send({ currentUser: user });
  }
);

export { router as signupRouter };
