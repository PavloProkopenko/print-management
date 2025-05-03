import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Box,
  Progress,
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import API from '@/api/axios'

interface PrintModalProps {
  isOpen: boolean
  onClose: () => void
  printerId: number
  onSuccess: () => void
}

const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export default function PrintModal({ isOpen, onClose, printerId, onSuccess }: PrintModalProps) {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Перевірка типу файлу
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      toast({
        title: 'Помилка',
        description: 'Дозволені тільки файли PDF та Word',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
  
    setFile(selectedFile)
    // Тут можна додати логіку для підрахунку кількості сторінок
    // Для прикладу, використовуємо випадкове число від 1 до 20
    setPages(Math.floor(Math.random() * 20) + 1)
  }

  const handlePrint = async () => {
    if (!file || !user) return

    setIsLoading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('printerId', printerId.toString())
      formData.append('document', file)
      formData.append('pages', pages.toString())

      await API.post('/print', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadProgress(progress)
        },
      })

      toast({
        title: 'Успіх',
        description: 'Документ успішно відправлено на друк',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Print error:', error)
      toast({
        title: 'Помилка',
        description: 'Не вдалося відправити документ на друк',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Надрукувати документ</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Виберіть файл</FormLabel>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                ref={fileInputRef}
              />
            </FormControl>
            {file && (
              <Box w="100%">
                <Text>Назва файлу: {file.name}</Text>
                <Text>Тип файлу: {file.type}</Text>
                <Text>Розмір: {(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                <Text>Кількість сторінок: {pages}</Text>
              </Box>
            )}
            {isLoading && (
              <Box w="100%">
                <Progress value={uploadProgress} />
                <Text mt={2}>Завантаження: {uploadProgress}%</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handlePrint} isLoading={isLoading}>
            Надрукувати
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Скасувати
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 