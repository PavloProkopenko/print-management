import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import Login from './pages/Login'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login/>
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </StrictMode>,
)
