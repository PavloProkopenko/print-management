import express from 'express';
import { register, login, getMe } from '../controllers/user.controller';
import { protect } from '../middlewares/user.middleware';

const router = express.Router();

router.post('/registration', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);
router.get('/me', protect as express.RequestHandler, getMe as express.RequestHandler)

export default router;
