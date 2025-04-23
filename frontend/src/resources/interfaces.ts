export interface User {
    id: string
    email: string
    role: string
}

export interface AuthContextProps {
    user: User | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}