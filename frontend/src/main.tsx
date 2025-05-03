import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import PrivateRoute from './routes/PrivateRoute'
import { AuthProvider } from './context/AuthContext'
import Registration from './pages/Registration'
import { RoutePath } from './resources/enums'
import AdminDashboard from './pages/Admin/AdminDashboard'

const router = createBrowserRouter([
  {
    path: RoutePath.Dashboard,
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: RoutePath.Login,
    element: <Login />
  },
  {
    path: RoutePath.Registration,
    element: <Registration />
  },
  {
    path: RoutePath.AdminDashboard,
    element: <AdminDashboard />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ChakraProvider>
  </StrictMode>,
)
