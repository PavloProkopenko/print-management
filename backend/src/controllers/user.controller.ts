import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { generateToken } from '../utils/jwt'
import { AuthRequest } from '../middlewares/user.middleware'

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.users.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const userExists = await prisma.users.findUnique({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                email,
                password: hashedPassword,
                role: 'user',
            },
        });

        const token = generateToken(user.id, user.role);
        res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const user = await prisma.users.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error instanceof Error ? error.message : String(error) 
        });
    }
}; 