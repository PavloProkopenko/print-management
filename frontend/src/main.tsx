import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import PrivateRoute from './routes/PrivateRoute'
import { AuthProvider } from './context/AuthContext'
import Registration from './pages/Registration'
import { AdminRoutePath, RoutePath } from './resources/enums'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import Printers from './pages/Printers'
import Settings from './pages/Settings'

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
    path: AdminRoutePath.Dashboard,
    element: (
      <PrivateRoute>
        <AdminDashboard />
      </PrivateRoute>
    )
  },
  {
    path: AdminRoutePath.Users,
    element: (
      <PrivateRoute>
        <AdminUsers />
      </PrivateRoute>
    )
  },
  {
    path: RoutePath.Printers,
    element: (
      <PrivateRoute>
        <Printers />
      </PrivateRoute>
    )
  },
  {
    path: RoutePath.Settings,
    element: (
      <PrivateRoute>
        <Settings />
      </PrivateRoute>
    )
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
