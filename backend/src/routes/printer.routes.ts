import express from 'express';
import {
    createPrintJob,
    getPrinters,
    completePrintJob,
    getUserStats,
    getAdminStats
} from '../controllers/printer.controller';
import { protect } from '../middlewares/user.middleware';

const router = express.Router();

// Захищені роути (потребують автентифікації)
router.post('/print', protect as express.RequestHandler, createPrintJob as express.RequestHandler);
router.post('/complete', protect as express.RequestHandler, completePrintJob as express.RequestHandler);
router.get('/user/:userId/stats', protect as express.RequestHandler, getUserStats as express.RequestHandler);
router.get('/admin/stats', protect as express.RequestHandler, getAdminStats as express.RequestHandler);

// Публічні роути
router.get('/printers', getPrinters);

export default router;
