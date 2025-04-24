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
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';
import API from '@/api/axios';
import { RoutePath } from '@/resources/enums';

export default function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInput>();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormInput) => {
        try {
            const res = await API.post(RoutePath.Login, data);
            const { token, user } = res.data;

            localStorage.setItem('token', token)
            console.log('User logged in:', user)

            navigate(RoutePath.Dashboard)
        } catch (error: any) {
            console.log(error);
            alert(error.response?.data?.message || "Login failed")
        }
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
                <Flex p={8} flex={1} align={'center'} justify={'center'} >
                    <Container bg='white' p={8} borderRadius={'lg'} shadow={'xl'}>
                        <Stack spacing={4} w={'full'} >
                            <Heading fontSize={'2xl'}>Login to your account</Heading>
                            <FormControl id="email">
                                <FormLabel>Email address</FormLabel>
                                <Input type="email" {...register('email', { required: 'Email is required' })} />
                                {errors.email && (
                                    <Text color='red.500' fontSize={'sm'}>
                                        {errors.email.message}
                                    </Text>
                                )}
                            </FormControl>
                            <FormControl id="password">
                                <FormLabel>Password</FormLabel>
                                <Input type="password" {...register('password', { required: 'Password is requred' })} />
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
                                    <Checkbox {...register('remember')}>Remember me</Checkbox>
                                </Stack>
                                <Button type='submit' colorScheme={'blue'} variant={'solid'}>
                                    Login
                                </Button>
                                <Link onClick={() => navigate('/registration')}>
                                    <Text>
                                        Don't have account yet? Create it!
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