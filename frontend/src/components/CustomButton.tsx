import { Button, Flex } from '@chakra-ui/react'

interface IProps {
  text: string
  action: () => void
}

export default function CustomButton({ text, action }: IProps) {
  return (
    <Flex h="100vh" justifyContent="center" alignItems="center">
      <Button
        px={4}
        fontSize={'sm'}
        rounded={'full'}
        bg={'blue.400'}
        color={'white'}
        onClick={action}
        boxShadow={
          '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
        }
        _hover={{
          bg: 'blue.500',
        }}
        _focus={{
          bg: 'blue.500',
        }}>
        {text}
      </Button>
    </Flex>
  )
}