import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { io } from '../index'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { AuthRequest } from '../middlewares/user.middleware'

// Створюємо директорію uploads, якщо вона не існує
const uploadsDir = path.join(process.cwd(), 'src', 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Налаштування multer для збереження файлів
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Непідтримуваний тип файлу'))
    }
  }
})

// 1. Надіслати завдання на друк
export const createPrintJob = async (req: AuthRequest, res: Response) => {
    try {
        const { printerId, pages } = req.body
        const file = req.file

        console.log('Received file:', file)
        console.log('Uploads directory:', uploadsDir)
        console.log('File exists:', fs.existsSync(path.join(uploadsDir, file?.filename || '')))

        if (!file) {
            return res.status(400).json({ error: 'Файл не був завантажений' })
        }

        const userId = req.user?.id
        if (!userId) {
            return res.status(401).json({ error: 'Не авторизовано' })
        }

        // Перевіряємо чи принтер доступний
        const printer = await prisma.printer.findUnique({
            where: { id: parseInt(printerId) }
        })

        if (!printer) {
            return res.status(404).json({ error: 'Принтер не знайдено' })
        }

        if (printer.isBusy) {
            return res.status(400).json({ error: 'Принтер зайнятий' })
        }

        // Створюємо завдання на друк
        const printJob = await prisma.printJob.create({
            data: {
                userId,
                printerId: parseInt(printerId),
                document: file.filename,
                fileName: file.originalname || null,
                fileSize: file.size || null,
                fileType: file.mimetype || null,
                pages: parseInt(pages)
            }
        })

        // Оновлюємо статус принтера
        await prisma.printer.update({
            where: { id: parseInt(printerId) },
            data: { isBusy: true }
        })

        // Оновлюємо статистику користувача
        await prisma.userStats.upsert({
            where: { userId },
            update: {
                totalDocs: { increment: 1 },
                totalPages: { increment: parseInt(pages) },
                lastPrintedAt: new Date()
            },
            create: {
                userId,
                totalDocs: 1,
                totalPages: parseInt(pages),
                lastPrintedAt: new Date()
            }
        })

        // Відправляємо подію про зміну статусу принтера
        io.emit('printer_status_changed', {
            printerId: parseInt(printerId),
            isBusy: true
        })

        // Встановлюємо таймер для завершення друку
        const printTime = parseInt(pages) * 1000; // 1 секунда на сторінку
        setTimeout(async () => {
            await prisma.printer.update({
                where: { id: parseInt(printerId) },
                data: { isBusy: false }
            })

            io.emit('printer_status_changed', {
                printerId: parseInt(printerId),
                isBusy: false
            })
        }, printTime)

        res.status(201).json(printJob)
    } catch (error) {
        console.error('Помилка при створенні завдання на друк:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
}

// 2. Отримати список всіх принтерів
export const getPrinters = async (req: Request, res: Response) => {
    try {
        const printers = await prisma.printer.findMany()
        res.json(printers)
    } catch (error) {
        console.error('Помилка при отриманні списку принтерів:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
}

// 3. Завершити завдання (звільнити принтер)
export const completePrintJob = async (req: Request, res: Response) => {
    try {
        const { printerId } = req.body // Changed from req.params to req.body

        if (!printerId) {
            return res.status(400).json({ error: 'Не вказано ID принтера' })
        }

        // Оновлюємо статус принтера
        const printer = await prisma.printer.update({
            where: { id: parseInt(printerId.toString()) },
            data: { isBusy: false }
        })

        // Відправляємо подію про зміну статусу принтера
        io.emit('printer_status_changed', {
            printerId: parseInt(printerId.toString()),
            isBusy: false
        })

        res.json(printer)
    } catch (error) {
        console.error('Помилка при завершенні завдання на друк:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
}

// 4. Отримати статистику користувача
export const getUserStats = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId)
        
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Невірний формат ID користувача' })
        }

        const stats = await prisma.userStats.findUnique({
            where: { userId }
        })

        if (!stats) {
            return res.json({
                totalDocs: 0,
                totalPages: 0,
                lastPrintedAt: null
            })
        }

        res.json(stats)
    } catch (error) {
        console.error('Помилка при отриманні статистики користувача:', error)
        res.status(500).json({ error: 'Помилка сервера' })
    }
}

// 5. Отримати загальну статистику по всіх користувачах (для адміна)
export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const stats = await prisma.printJob.groupBy({
            by: ['userId'],
            _count: { _all: true },
            _sum: { pages: true },
        });

        const detailed = await Promise.all(
            stats.map(async (entry) => {
                const user = await prisma.user.findUnique({ 
                    where: { id: entry.userId } 
                });
                return {
                    userId: entry.userId,
                    email: user?.email,
                    totalDocs: entry._count?._all || 0,
                    totalPages: entry._sum?.pages || 0,
                };
            })
        );

        return res.json(detailed);
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
