import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Switch, useToast } from '@chakra-ui/react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import API from '@/api/axios'

interface User {
  userId: number
  email: string
  role: string
  access: boolean
  totalDocs: number
  totalPages: number
}

export default function AdminUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const toast = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get('/admin/stats')
        console.log(response.data)
        setUsers(response.data)
      } catch (error) {
        toast({
          title: 'Помилка',
          description: 'Не вдалося завантажити список користувачів',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  
    fetchUsers()
  }, [])
  console.log(users)
  const handleAccessChange = async (userId: number, access: boolean) => {
    try {
      await API.patch(`/admin/users/${userId}/access`, { access })
      setUsers(users.map(u => u.userId === userId ? { ...u, access } : u))
      toast({
        title: 'Успіх',
        description: `Доступ користувача ${access ? 'надано' : 'заблоковано'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося змінити доступ користувача',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Sidebar>
      <Box p={4}>
        <Heading mb={4}>Керування користувачами</Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Роль</Th>
              <Th>Доступ</Th>
              <Th>Документів</Th>
              <Th>Сторінок</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.userId}>
                <Td>{user.email}</Td>
                <Td>{user.userId}</Td>
                <Td>
                  <Switch
                    isChecked={user.access}
                    onChange={(e) => handleAccessChange(user.userId, e.target.checked)}
                  />
                </Td>
                <Td>{user.totalDocs}</Td>
                <Td>{user.totalPages}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Sidebar>
  )
} 