import { Box, Heading, Text } from '@chakra-ui/react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  console.log(user)
  return (
    <Sidebar>
      <Box p={4}>
        <Heading mb={4}>Панель адміністратора</Heading>
        <Text>Ласкаво просимо, {user?.email}</Text>
        <Text mt={4}>Тут ви можете керувати користувачами та переглядати статистику</Text>
      </Box>
    </Sidebar>
  )
} 