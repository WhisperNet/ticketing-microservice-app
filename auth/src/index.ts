import { app } from './app';
import mongoose from 'mongoose';
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
