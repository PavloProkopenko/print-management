import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { generateToken } from '../utils/jwt'
import { AuthRequest } from '../middlewares/user.middleware'

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ 
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                role: true
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user.id, user.role);
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const userExists = await prisma.user.findUnique({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'USER',
            },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        const token = generateToken(user.id, user.role);
        res.status(201).json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const user = await prisma.user.findUnique({
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