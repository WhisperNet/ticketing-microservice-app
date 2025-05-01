import express from 'express';
import cookieSession from 'cookie-session';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';
import mongoose from 'mongoose';
const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: true,
  })
);
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.all('*splat', (req, res) => {
  throw new NotFoundError();
});
app.use(errorHandler);

const startUp = async () => {
  try {
    if (!process.env.JWT_KEY) throw Error('Environment variable not found');
    await mongoose.connect('mongodb://auth-mongodb-srv:27017/auth');
    console.log('Database connected');
    app.listen(3000, (err) => {
      console.log('Auth Servise is listening on port 3000!');
    });
  } catch (err) {
    console.log('Something went wrong while starting the app');
    console.log(err);
  }
};

startUp();
