import { RoutePath } from '@/resources/enums';
import { LoginFormInput } from '@/resources/types'
import {
    Button,
    Flex,
    Text,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Image,
    Container,
    Link,
    useToast,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
import { registerRequest } from '@/api/auth';

export default function Registration() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormInput>();
    const navigate = useNavigate();
    const toast = useToast();

    const onSubmit = async (data: LoginFormInput) => {
        try {
            const { token, user } = await registerRequest(data.email, data.password);

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            console.log('Користувач зареєстрований:', user)

            toast({
                title: 'Успішна реєстрація',
                description: 'Вітаємо! Ви успішно зареєструвалися.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            navigate(RoutePath.Dashboard)
        } catch (error: any) {
            console.error('Помилка реєстрації:', error)
            toast({
                title: 'Помилка реєстрації',
                description: error.response?.data?.message || 'Не вдалося зареєструватися',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
                <Flex p={8} flex={1} align={'center'} justify={'center'} >
                    <Container bg='white' p={8} borderRadius={'lg'} shadow={'xl'}>
                        <Stack spacing={4} w={'full'} >
                            <Heading fontSize={'2xl'}>Реєстрація</Heading>
                            <FormControl id="email">
                                <FormLabel>Email</FormLabel>
                                <Input type="email" {...register('email', { required: 'Email обов\'язковий' })} />
                                {errors.email && (
                                    <Text color='red.500' fontSize={'sm'}>
                                        {errors.email.message}
                                    </Text>
                                )}
                            </FormControl>
                            <FormControl id="password">
                                <FormLabel>Пароль</FormLabel>
                                <Input type="password" {...register('password', { required: 'Пароль обов\'язковий' })} />
                                {errors.password && (
                                    <Text color='red.500' fontSize={'sm'}>
                                        {errors.password.message}
                                    </Text>
                                )}
                            </FormControl>
                            <Stack spacing={6}>
                                <Button 
                                    type='submit' 
                                    colorScheme={'blue'} 
                                    variant={'solid'}
                                    isLoading={isSubmitting}
                                >
                                    Зареєструватися
                                </Button>
                                <Link onClick={() => navigate(RoutePath.Login)}>
                                    <Text>
                                        Вже маєте обліковий запис? Увійти!
                                    </Text>
                                </Link>
                            </Stack>
                        </Stack>
                    </Container>
                </Flex>
                <Flex flex={1}>
                    <Image
                        alt={'Registration Image'}
                        objectFit={'cover'}
                        src={
                            'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80'
                        }
                    />
                </Flex>
            </Stack>
        </form>
    )
}