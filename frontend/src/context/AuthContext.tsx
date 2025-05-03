import { useState, createContext, useContext, ReactNode, useEffect } from "react"
import { AuthContextProps, User } from "@/resources/interfaces"
import { loginRequest } from "@/api/auth"
import API from "@/api/axios"

const AuthContext = createContext<AuthContextProps | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Перевірка автентифікації при завантаженні
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await API.get('/auth/me')
          setUser(response.data.user)
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await loginRequest(email, password)
      localStorage.setItem('token', token)
      setUser(user)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) {
    return <div>Loading...</div> // Або ваш компонент завантаження
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}