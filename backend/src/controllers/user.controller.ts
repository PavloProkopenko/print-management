import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { generateToken } from '../utils/jwt'

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role })
  return res.json({ token })
}
