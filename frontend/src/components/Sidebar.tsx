import { ReactNode } from 'react'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
} from '@chakra-ui/react'
import {
  FiHome,
  FiPrinter,
  FiUsers,
  FiSettings,
  FiMenu,
  FiLogOut,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { AdminRoutePath, RoutePath, UserRoles } from '@/resources/enums'
import { useAuth } from '@/context/AuthContext'

interface LinkItemProps {
  name: string
  icon: IconType
  path: string
  adminOnly?: boolean
}

const createLinkItems = (userRole?: string): Array<LinkItemProps> => [
  { name: 'Головна', icon: FiHome, path: userRole === UserRoles.Admin ? AdminRoutePath.Dashboard : RoutePath.Dashboard },
  { name: 'Принтери', icon: FiPrinter, path: RoutePath.Printers },
  { name: 'Користувачі', icon: FiUsers, path: AdminRoutePath.Users, adminOnly: true },
  { name: 'Налаштування', icon: FiSettings, path: RoutePath.Settings },
]

export default function Sidebar({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, logout } = useAuth()
  const location = useLocation()

  const linkItems = createLinkItems(user?.role)
  const filteredLinks = linkItems.filter(link => !link.adminOnly || user?.role === UserRoles.Admin)

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose()}
        display={{ base: 'none', md: 'block' }}
        links={filteredLinks}
        currentPath={location.pathname}
        onLogout={logout}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full">
        <DrawerContent>
          <SidebarContent
            onClose={onClose}
            links={filteredLinks}
            currentPath={location.pathname}
            onLogout={logout}
          />
        </DrawerContent>
      </Drawer>
      <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void
  links: LinkItemProps[]
  currentPath: string
  onLogout: () => void
}

const SidebarContent = ({ onClose, links, currentPath, onLogout, ...rest }: SidebarProps) => {
  const navigate = useNavigate()

  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="40" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="xl" fontFamily="monospace" fontWeight="bold">
          Print Management
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {links.map((link) => (
        <NavItem
          key={link.name}
          icon={link.icon}
          isActive={currentPath === link.path}
          onClick={() => navigate(link.path)}
        >
          {link.name}
        </NavItem>
      ))}
      <NavItem
        icon={FiLogOut}
        onClick={onLogout}
      >
        Вийти
      </NavItem>
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: IconType
  children: any
  isActive?: boolean
}

const NavItem = ({ icon, children, isActive, ...rest }: NavItemProps) => {
  return (
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      bg={isActive ? 'blue.400' : 'transparent'}
      color={isActive ? 'white' : 'inherit'}
      _hover={{
        bg: 'blue.400',
        color: 'white',
      }}
      {...rest}
      mb={2}
    >
      {icon && (
        <Icon
          mr="4"
          fontSize="16"
          _groupHover={{
            color: 'white',
          }}
          as={icon}
        />
      )}
      {children}
    </Flex>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />
      <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
        Print Management
      </Text>
    </Flex>
  )
}