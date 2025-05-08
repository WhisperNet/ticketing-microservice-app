import express from 'express';
import { setCurrentUser } from '@whispernet-sust/ticket-common';
const router = express.Router();

router.get('/api/users/currentuser', setCurrentUser, (req, res) => {
  console.log('TEST');
  res.status(200).send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
