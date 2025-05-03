import API from '@/api/axios'

export const loginRequest = async (email: string, password: string) => {
  const response = await API.post('/auth/login', { email, password })
  return response.data
}

export const registerRequest = async (email: string, password: string) => {
  const response = await API.post('/auth/registration', { email, password })
  return response.data
}
