import express, { Request, Response } from 'express';
import { User } from '../models/User';
import { Password } from '../services/password';
import JWT from 'jsonwebtoken';
import { body } from 'express-validator';
import { requestValidationHandler } from '../middlewares/request-validation-handler';
import { BadRequestError } from '../errors/bad-request-error';
const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('Password can not be empty'),
  ],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    if (!foundUser) throw new BadRequestError('Invalid Credentials');
    const isVerified = await Password.toCheck(foundUser.password, password);
    if (!isVerified) throw new BadRequestError('Inavlid credentials');
    const jsonToken = JWT.sign(
      {
        id: foundUser.id,
        email: foundUser.email,
      },
      process.env.JWT_KEY!
    );
    req.session = {
      JWT: jsonToken,
    };
    res.status(200).send({ currentUser: foundUser });
  }
);

export { router as signinRouter };
