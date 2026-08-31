import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { DashboardPage } from '@/features/reservations/DashboardPage'
import { ReservationsPage } from '@/features/reservations/ReservationsPage'
import { SetupWizardLayout } from '@/features/setup/components/SetupWizardLayout'
import { BookingWizard } from '@/features/booking/BookingWizard'
import { BookingSuccessWrapper } from '@/features/booking/BookingSuccessWrapper'
import { ReservationStatusPage } from '@/features/booking/components/status/ReservationStatusPage'
import {
  PaymentFailedReturn,
  PaymentPendingReturn,
  PaymentSuccessfulReturn,
} from '@/features/booking/components/payment/PaymentReturnPage'
import { useAuthStore } from '@/features/auth/store/authStore'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { UsersPage } from '@/features/users/UsersPage'

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

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
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

const requireSettingsRole = () => {
  const role = useAuthStore.getState().user?.rol
  if (role !== 'ADMIN_RESTAURANTE' && role !== 'SUPER_ADMIN') throw redirect({ to: '/dashboard' })
}

const reservationsRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard/reservas', component: ReservationsPage })
const usersRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard/usuarios', beforeLoad: requireSettingsRole, component: UsersPage })
const settingsRestaurantRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard/configuracion/restaurante', beforeLoad: requireSettingsRole, component: () => <SettingsPage section="restaurante" /> })
const settingsBranchesRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard/configuracion/locales', beforeLoad: requireSettingsRole, component: () => <SettingsPage section="locales" /> })
const settingsSchedulesRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard/configuracion/horarios', beforeLoad: requireSettingsRole, component: () => <SettingsPage section="horarios" /> })
const settingsTablesRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard/configuracion/mesas', beforeLoad: requireSettingsRole, component: () => <SettingsPage section="mesas" /> })
const settingsRulesRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard/configuracion/reglas', beforeLoad: requireSettingsRole, component: () => <SettingsPage section="reglas" /> })
const settingsBrandRoute = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard/configuracion/marca', beforeLoad: requireSettingsRole, component: () => <SettingsPage section="marca" /> })

const settingsIndexRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard/configuracion',
  beforeLoad: () => { throw redirect({ to: '/dashboard/configuracion/restaurante' }) },
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
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === 'string' ? search.token : undefined }),
  component: BookingSuccessWrapper,
})

const reservationStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reserva/$codigo',
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === 'string' ? search.token : undefined }),
  component: ReservationStatusPage,
})

const paymentSuccessfulRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reserva/$codigo/pago-exitoso',
  component: PaymentSuccessfulReturn,
})

const paymentPendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reserva/$codigo/pago-pendiente',
  component: PaymentPendingReturn,
})

const paymentFailedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reserva/$codigo/pago-fallido',
  component: PaymentFailedReturn,
})

const routeTree = rootRoute.addChildren([
  authRoute.addChildren([loginRoute, registerRoute]),
  indexRoute,
  forgotPasswordRoute,
  protectedRoute.addChildren([dashboardRoute, reservationsRoute, usersRoute, settingsIndexRoute, settingsRestaurantRoute, settingsBranchesRoute, settingsSchedulesRoute, settingsTablesRoute, settingsRulesRoute, settingsBrandRoute, setupRoute]),
  bookingRoute,
  bookingSuccessRoute,
  reservationStatusRoute,
  paymentSuccessfulRoute,
  paymentPendingRoute,
  paymentFailedRoute,
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
