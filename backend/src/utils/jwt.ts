import jwt from 'jsonwebtoken'

export const generateToken = (id: number, role: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyToken = (token: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    
    return jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
        role: string;
    };
};
