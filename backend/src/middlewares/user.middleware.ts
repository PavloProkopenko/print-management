import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: number;
        role: string;
      };
      
      req.user = decoded;
      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Token failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied. Admin role required' });
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};