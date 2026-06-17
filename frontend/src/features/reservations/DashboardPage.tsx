import { useQuery } from '@tanstack/react-query'
import { useCurrentUser, useAuthStore } from '@/features/auth/store/authStore'
import { apiFetch } from '@/shared/api/apiClient'
import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

interface RestauranteDto {
  id: number
  usuarioAdminId: number
  nombrePublico: string
  slugPublico: string
  razonSocial: string | null
  cuit: string | null
  tipoCocina: string | null
  ciudadPrincipal: string | null
  emailComercial: string | null
  slogan: string | null
  activo: boolean
  publicado: boolean
}

interface SucursalDto {
  id: number
  nombre: string
  slug: string
  direccion: string
  ciudad: string | null
  provincia: string | null
  telefono: string | null
  esPrincipal: boolean
  activa: boolean
}

function useRestaurante(usuarioAdminId: number | undefined) {
  return useQuery({
    queryKey: ['restaurante-by-admin', usuarioAdminId],
    queryFn: () =>
      apiFetch<RestauranteDto[]>('/api/restaurante').then(
        (list) => list.find((r) => r.usuarioAdminId === usuarioAdminId) ?? null,
      ),
    enabled: !!usuarioAdminId,
  })
}

function useSucursales(restauranteId: number | undefined) {
  return useQuery({
    queryKey: ['sucursales', restauranteId],
    queryFn: () => apiFetch<SucursalDto[]>(`/api/sucursal/restaurante/${restauranteId}`),
    enabled: !!restauranteId,
  })
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-on-surface-variant min-w-32">{label}</span>
      <span className="text-on-surface font-medium">{value}</span>
    </div>
  )
}

export function DashboardPage() {
  const user = useCurrentUser()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const restauranteQuery = useRestaurante(user?.id)
  const restaurante = restauranteQuery.data
  const sucursalesQuery = useSucursales(restaurante?.id)

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-surface p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold text-on-surface">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-error transition-colors px-3 py-2 rounded-lg hover:bg-error/10"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>

      {/* Usuario */}
      <section className="bg-surface-container rounded-xl p-5 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Usuario</h2>
        <InfoRow label="Nombre" value={user?.nombreCompleto} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Rol" value={user?.rol} />
      </section>

      {/* Restaurante */}
      {restauranteQuery.isLoading && (
        <div className="text-sm text-on-surface-variant p-4">Cargando restaurante...</div>
      )}
      {restaurante && (
        <section className="bg-surface-container rounded-xl p-5 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Restaurante</h2>
          <div className="flex flex-col gap-1">
            <InfoRow label="Nombre" value={restaurante.nombrePublico} />
            <InfoRow label="Slug" value={restaurante.slugPublico} />
            <InfoRow label="Razón social" value={restaurante.razonSocial} />
            <InfoRow label="CUIT" value={restaurante.cuit} />
            <InfoRow label="Tipo cocina" value={restaurante.tipoCocina} />
            <InfoRow label="Ciudad" value={restaurante.ciudadPrincipal} />
            <InfoRow label="Email" value={restaurante.emailComercial} />
            <InfoRow label="Slogan" value={restaurante.slogan} />
            <InfoRow label="Estado" value={restaurante.activo ? 'Activo' : 'Inactivo'} />
          </div>
        </section>
      )}

      {/* Sucursales */}
      {sucursalesQuery.isLoading && (
        <div className="text-sm text-on-surface-variant p-4">Cargando sucursales...</div>
      )}
      {sucursalesQuery.data && sucursalesQuery.data.length > 0 && (
        <section className="bg-surface-container rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Sucursales ({sucursalesQuery.data.length})
          </h2>
          <div className="flex flex-col gap-4">
            {sucursalesQuery.data.map((s) => (
              <div key={s.id} className="border border-outline-variant rounded-lg p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-on-surface">{s.nombre}</span>
                  {s.esPrincipal && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Principal</span>
                  )}
                  {!s.activa && (
                    <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full">Inactiva</span>
                  )}
                </div>
                <InfoRow label="Slug" value={s.slug} />
                <InfoRow label="Dirección" value={s.direccion} />
                <InfoRow label="Ciudad" value={s.ciudad} />
                <InfoRow label="Provincia" value={s.provincia} />
                <InfoRow label="Teléfono" value={s.telefono} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
