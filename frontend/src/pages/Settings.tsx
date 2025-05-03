import { Box, Text, Center } from '@chakra-ui/react'
import Sidebar from '@/components/Sidebar'

export default function Settings() {
  return (
    <Sidebar>
      <Box p={4}>
        <Center h="80vh">
          <Text fontSize="2xl">На разі в розробці</Text>
        </Center>
      </Box>
    </Sidebar>
  )
}