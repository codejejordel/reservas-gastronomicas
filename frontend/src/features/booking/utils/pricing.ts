// TODO: mover a config global cuando esté disponible en backend
export const CARGO_SERVICIO_POR_PERSONA = 500

export function calcularCargoServicio(partySize: number): number {
  return partySize * CARGO_SERVICIO_POR_PERSONA
}

export function calcularTotal(partySize: number, montoSenia: number = 0): number {
  return calcularCargoServicio(partySize) + montoSenia
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
