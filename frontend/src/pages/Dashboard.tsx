import { Box, Flex, SimpleGrid, Stat, StatLabel, StatNumber, useColorModeValue, Heading, Text } from '@chakra-ui/react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { useState, useEffect } from 'react'
import API from '@/api/axios'
import { BsFileText } from 'react-icons/bs'
import { FiPrinter } from 'react-icons/fi'
import { GoGraph } from 'react-icons/go'
import { FaCalendarAlt } from 'react-icons/fa'
import CustomButton from '@/components/CustomButton'
import { useNavigate } from 'react-router-dom'
import { RoutePath } from '@/resources/enums'

interface StatsCardProps {
  title: string
  stat: string
  icon: React.ReactNode
}

function StatsCard(props: StatsCardProps) {
  const { title, stat, icon } = props
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={useColorModeValue('gray.800', 'gray.500')}
      rounded={'lg'}>
      <Flex justifyContent={'space-between'}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={'medium'} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
            {stat}
          </StatNumber>
        </Box>
        <Box
          my={'auto'}
          color={useColorModeValue('gray.800', 'gray.200')}
          alignContent={'center'}>
          {icon}
        </Box>
      </Flex>
    </Stat>
  )
}

interface UserStats {
  totalDocs: number
  totalPages: number
  activePrinters: number
  lastPrintedAt: string | null
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({ 
    totalDocs: 0, 
    totalPages: 0, 
    activePrinters: 0,
    lastPrintedAt: null 
  })
  const [printers, setPrinters] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get(`/user/${user?.id}/stats`)
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
      }
    }

    const fetchPrinters = async () => {
      try {
        const response = await API.get('/printers')
        setPrinters(response.data)
      } catch (error) {
        console.error('Failed to fetch printers:', error)
      }
    }

    fetchStats()
    fetchPrinters()
  }, [user?.id])

  const activePrinters = printers.filter(printer => printer.isBusy).length

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Немає даних'
    const date = new Date(dateString)
    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Sidebar>
      <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
        <Heading textAlign={'center'} fontSize={'4xl'} py={10} fontWeight={'bold'}>
          Ласкаво просимо, {user?.email}
        </Heading>
        <Text textAlign={'center'} fontSize={'xl'} color={'gray.500'} mb={10}>
          Ваша статистика друку
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={{ base: 5, lg: 8 }}>
          <StatsCard
            title={'Документів надруковано'}
            stat={stats.totalDocs.toString()}
            icon={<BsFileText size={'3em'} />}
          />
          <StatsCard
            title={'Сторінок надруковано'}
            stat={stats.totalPages.toString()}
            icon={<GoGraph size={'3em'} />}
          />
          <StatsCard
            title={'Використовується принтерів'}
            stat={activePrinters.toString()}
            icon={<FiPrinter size={'3em'} />}
          />
          <StatsCard
            title={'Останній друк'}
            stat={formatDate(stats.lastPrintedAt)}
            icon={<FaCalendarAlt size={'3em'} />}
          />
        </SimpleGrid>
      </Box>
      <CustomButton text='Перейти до друку' action={() => navigate(RoutePath.Printers)}/>
    </Sidebar>
  )
}
