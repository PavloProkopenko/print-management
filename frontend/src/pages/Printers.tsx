import { Box, Heading, Text, SimpleGrid, Button, useToast, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import API from '@/api/axios'
import PrintModal from '@/components/PrintModal'
import { io, Socket } from 'socket.io-client'

interface Printer {
  id: number
  name: string
  isBusy: boolean
}

interface PrinterStatusEvent {
  printerId: number
  isBusy: boolean
}

export default function Printers() {
  const { user } = useAuth()
  const [printers, setPrinters] = useState<Printer[]>([])
  const [selectedPrinter, setSelectedPrinter] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [socketStatus, setSocketStatus] = useState<string>('Відключено')
  const socketRef = useRef<Socket | null>(null)
  const toast = useToast()

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await API.get('/printers')
        setPrinters(response.data)
      } catch (error) {
        console.error('Failed to fetch printers:', error)
        toast({
          title: 'Помилка',
          description: 'Не вдалося завантажити список принтерів',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }

    fetchPrinters()

    // Створюємо WebSocket підключення тільки якщо воно ще не існує
    if (!socketRef.current) {
      const socket: Socket = io('http://localhost:8080', {
        path: '/socket.io',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      })

      socketRef.current = socket

      // Логування подій WebSocket
      socket.on('connect', () => {
        console.log('WebSocket підключено')
        setSocketStatus('Підключено')
      })

      socket.on('disconnect', () => {
        console.log('WebSocket відключено')
        setSocketStatus('Відключено')
      })

      socket.on('connect_error', (error) => {
        console.error('Помилка підключення WebSocket:', error)
        setSocketStatus('Помилка підключення')
      })

      // Слухаємо події зміни статусу принтера
      socket.on('printer_status_changed', (data: PrinterStatusEvent) => {
        console.log('Отримано подію зміни статусу:', data)
        setPrinters(prevPrinters => 
          prevPrinters.map(printer => 
            printer.id === data.printerId 
              ? { ...printer, isBusy: data.isBusy } 
              : printer
          )
        )

        // Показуємо повідомлення про зміну статусу
        const printer = printers.find(p => p.id === data.printerId)
        if (printer) {
          toast({
            title: 'Статус принтера змінено',
            description: `Принтер "${printer.name}" ${data.isBusy ? 'зайнятий' : 'вільний'}`,
            status: data.isBusy ? 'warning' : 'success',
            duration: 3000,
            isClosable: true,
          })
        }
      })
    }

    // Відключаємо сокет при розмонтуванні компонента
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [toast])

  const handlePrintClick = (printerId: number) => {
    if (!user?.access) {
      toast({
        title: 'Доступ заборонено',
        description: 'У вас немає доступу до друку. Зверніться до адміністратора.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    setSelectedPrinter(printerId)
    setIsModalOpen(true)
  }

  const handlePrintSuccess = () => {
    setIsModalOpen(false)
    setSelectedPrinter(null)
  }

  return (
    <Sidebar>
      <Box flex="1" p={8}>
        <Heading mb={6} textAlign={'center'}>Принтери</Heading>
        
        {!user?.access && (
          <Alert status="error" mb={6}>
            <AlertIcon />
            <Box>
              <AlertTitle>Доступ до друку заборонено</AlertTitle>
              <AlertDescription>
                У вас немає доступу до друку. Зверніться до адміністратора для отримання доступу.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <Text textAlign={'center'} fontSize={'sm'} color={'gray.500'} mb={10}>
          Статус підключення: {socketStatus}
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {printers.map((printer) => (
            <Box
              key={printer.id}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              bg={printer.isBusy ? 'gray.100' : 'white'}
            >
              <Heading size="md" mb={2}>
                {printer.name}
              </Heading>
              <Text mb={4} color={printer.isBusy ? 'red.1000' : 'green.800'}>
                Статус: {printer.isBusy ? 'Зайнятий' : 'Вільний'}
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => handlePrintClick(printer.id)}
                isDisabled={printer.isBusy || !user?.access}
              >
                Надрукувати
              </Button>
            </Box>
          ))}
        </SimpleGrid>

        {selectedPrinter && (
          <PrintModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            printerId={selectedPrinter}
            onSuccess={handlePrintSuccess}
          />
        )}
      </Box>
    </Sidebar>
  )
} 