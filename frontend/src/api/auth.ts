import API from '@/api/axios'

export const loginRequest = async (email: string, password: string) => {
  const response = await API.post('/login', { email, password })
  return response.data
}

export const registerRequest = async (email: string, password: string) => {
  const response = await API.post('/register', { email, password })
  return response.data
}
