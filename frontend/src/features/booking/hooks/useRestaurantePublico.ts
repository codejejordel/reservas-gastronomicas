import { useQuery } from '@tanstack/react-query'
import { getRestauranteBySlug } from '../services/bookingApi'
import type { RestaurantePublic } from '../types/bookingTypes'

export function useRestaurantePublico(slug: string | undefined) {
  return useQuery<RestaurantePublic, Error>({
    queryKey: ['restaurante-public', slug],
    queryFn: () => getRestauranteBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar si es 404
      if (error instanceof Error && error.message.includes('404')) return false
      return failureCount < 2
    },
  })
}
