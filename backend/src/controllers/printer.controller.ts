import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { io } from '../index'

// 1. Надіслати завдання на друк
export const createPrintJob = async (req: Request, res: Response) => {
    const { userId, printerId, document, pages } = req.body;

    try {
        const printer = await prisma.printer.findUnique({ 
            where: { id: printerId } 
        });

        if (!printer) {
            return res.status(404).json({ message: 'Printer not found' });
        }

        if (printer.isBusy) {
            return res.status(400).json({ message: 'Printer is busy' });
        }

        // Позначаємо принтер як зайнятий
        await prisma.printer.update({
            where: { id: printerId },
            data: { isBusy: true },
        });

        // Відправляємо оновлення статусу через Socket.IO
        io.emit('printer_status_changed', {
            printerId,
            isBusy: true,
            status: 'printing',
            job: { document, pages }
        });

        const job = await prisma.printJob.create({
            data: {
                userId,
                printerId,
                document,
                pages,
            },
        });

        return res.status(201).json(job);
    } catch (error) {
        console.error('Create print job error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// 2. Отримати список всіх принтерів
export const getPrinters = async (req: Request, res: Response) => {
    try {
        const printers = await prisma.printer.findMany();
        res.json(printers);
    } catch (error) {
        console.error('Get printers error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// 3. Завершити завдання (звільнити принтер)
export const completePrintJob = async (req: Request, res: Response) => {
    const { printerId } = req.body;

    try {
        const printer = await prisma.printer.update({
            where: { id: printerId },
            data: { isBusy: false },
        });

        // Відправляємо оновлення статусу через Socket.IO
        io.emit('printer_status_changed', {
            printerId,
            isBusy: false,
            status: 'idle'
        });

        return res.json(printer);
    } catch (error) {
        console.error('Complete print job error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

// 4. Отримати статистику користувача
export const getUserStats = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);

    try {
        const jobs = await prisma.printJob.findMany({
            where: { userId },
        });

        const totalDocs = jobs.length;
        const totalPages = jobs.reduce((sum, job) => sum + job.pages, 0);

        return res.json({ totalDocs, totalPages });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

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
