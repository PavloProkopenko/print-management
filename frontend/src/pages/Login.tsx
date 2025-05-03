import { LoginFormInput } from '@/resources/types'
import {
    Button,
    Checkbox,
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
import { AdminRoutePath, RoutePath } from '@/resources/enums';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormInput>();
    const navigate = useNavigate();
    const { login } = useAuth();
    const toast = useToast();

    const onSubmit = async (data: LoginFormInput) => {
        try {
            await login(data.email, data.password);
            
            if (data.remember) {
                localStorage.setItem('remember', 'true');
            } else {
                localStorage.removeItem('remember');
            }

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'ADMIN') {
                navigate(AdminRoutePath.Dashboard);
            } else {
                navigate(RoutePath.Dashboard);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast({
                title: 'Помилка входу',
                description: error.response?.data?.message || 'Невірний email або пароль',
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
                            <Heading fontSize={'2xl'}>Вхід в систему</Heading>
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
                                <Stack
                                    direction={{ base: 'column', sm: 'row' }}
                                    align={'start'}
                                    justify={'space-between'}>
                                    <Checkbox {...register('remember')}>Запам'ятати мене</Checkbox>
                                </Stack>
                                <Button 
                                    type='submit' 
                                    colorScheme={'blue'} 
                                    variant={'solid'}
                                    isLoading={isSubmitting}
                                >
                                    Увійти
                                </Button>
                                <Link onClick={() => navigate('/registration')}>
                                    <Text>
                                        Немає облікового запису? Зареєструватися!
                                    </Text>
                                </Link>
                            </Stack>
                        </Stack>
                    </Container>
                </Flex>
                <Flex flex={1}>
                    <Image
                        alt={'Login Image'}
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