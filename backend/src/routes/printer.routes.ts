import express from 'express';
import {
    createPrintJob,
    getPrinters,
    completePrintJob,
    getUserStats,
    getAdminStats,
    upload
} from '../controllers/printer.controller';
import { protect } from '../middlewares/user.middleware';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Налаштування multer для збереження файлів
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const uploadMulter = multer({ storage: storage })

// Захищені роути (потребують автентифікації)
router.post('/print', protect as express.RequestHandler, uploadMulter.single('document'), createPrintJob as express.RequestHandler);
router.post('/complete', protect as express.RequestHandler, completePrintJob as express.RequestHandler);
router.get('/user/:userId/stats', protect as express.RequestHandler, getUserStats as express.RequestHandler);
router.get('/admin/stats', protect as express.RequestHandler, getAdminStats as express.RequestHandler);

// Публічні роути
router.get('/printers', getPrinters);

export default router;
