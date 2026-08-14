import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { DashboardPage } from '@/features/reservations/DashboardPage'
import { SetupWizardLayout } from '@/features/setup/components/SetupWizardLayout'
import { BookingWizard } from '@/features/booking/BookingWizard'
import { BookingSuccessWrapper } from '@/features/booking/BookingSuccessWrapper'
import { useAuthStore } from '@/features/auth/store/authStore'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  component: AuthLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/login',
  component: () => null,
})

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/register',
  component: () => null,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/login' }) },
})

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  beforeLoad: () => {
    const token = useAuthStore.getState().token
    if (!token) throw redirect({ to: '/login' })
  },
  component: () => <Outlet />,
})

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const setupRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/setup',
  component: SetupWizardLayout,
})

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/r/$slug/reservar',
  component: BookingWizard,
})

const bookingSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/r/$slug/reservar/exito/$codigo',
  component: BookingSuccessWrapper,
})

const routeTree = rootRoute.addChildren([
  authRoute.addChildren([loginRoute, registerRoute]),
  indexRoute,
  protectedRoute.addChildren([dashboardRoute, setupRoute]),
  bookingRoute,
  bookingSuccessRoute,
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />
}
