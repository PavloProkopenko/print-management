import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'


async function main() {
  const hashedPassword = await bcrypt.hash('123123', 10) // Add your password

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      access: true
    },
  })

  console.log('Created user:', user)
}

main()
  .then(() => {
    console.log('Done')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
