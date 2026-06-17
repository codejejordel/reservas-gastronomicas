import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { setupApi } from '@/features/setup/services/setupApi'

function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useValidateSlug(value: string, restauranteId?: number) {
  const debounced = useDebounced(value)
  return useQuery({
    queryKey: ['validar-slug', debounced, restauranteId],
    queryFn: () => setupApi.validarSlug(debounced, restauranteId),
    enabled: debounced.length >= 3,
    staleTime: 10_000,
    retry: false,
  })
}

export function useValidateNombre(value: string, restauranteId?: number) {
  const debounced = useDebounced(value)
  return useQuery({
    queryKey: ['validar-nombre', debounced, restauranteId],
    queryFn: () => setupApi.validarNombre(debounced, restauranteId),
    enabled: debounced.length >= 3,
    staleTime: 10_000,
    retry: false,
  })
}

export function useValidateCuit(value: string, excludeId?: number) {
  const debounced = useDebounced(value)
  return useQuery({
    queryKey: ['validar-cuit', debounced, excludeId],
    queryFn: () => setupApi.validarCuit(debounced, excludeId),
    enabled: debounced.length >= 11,
    staleTime: 10_000,
    retry: false,
  })
}
