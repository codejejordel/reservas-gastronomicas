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

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup',
  component: SetupWizardLayout,
})

const routeTree = rootRoute.addChildren([
  authRoute.addChildren([loginRoute, registerRoute]),
  indexRoute,
  dashboardRoute,
  setupRoute,
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
