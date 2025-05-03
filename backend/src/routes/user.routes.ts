import express from 'express';
import { register, login, getMe, updateUserAccess, getAdminStats } from '../controllers/user.controller';
import { protect, isAdmin } from '../middlewares/user.middleware';

const router = express.Router();

// Публічні роути
router.post('/auth/registration', register as express.RequestHandler);
router.post('/auth/login', login as express.RequestHandler);

// Захищені роути
router.get('/users/me', protect as express.RequestHandler, getMe as express.RequestHandler);

// Адмін-роути
router.get('/admin/stats', protect as express.RequestHandler, isAdmin as express.RequestHandler, getAdminStats as express.RequestHandler);
router.patch('/admin/users/:userId/access', protect as express.RequestHandler, isAdmin as express.RequestHandler, updateUserAccess as express.RequestHandler);

export default router;
