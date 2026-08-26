const PAYMENT_ID_PATTERN = /^[1-9][0-9]{0,18}$/

export function getMercadoPagoPaymentId(search: string | URLSearchParams): string | null {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search

  for (const name of ['payment_id', 'collection_id']) {
    const value = params.get(name)?.trim()
    if (value && PAYMENT_ID_PATTERN.test(value)) return value
  }

  return null
}
