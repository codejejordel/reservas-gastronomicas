const MERCADO_PAGO_CHECKOUT_HOSTS = new Set([
  'www.mercadopago.com.ar',
  'sandbox.mercadopago.com.ar',
])

export function getSafeMercadoPagoCheckoutUrl(value: string | null): string | null {
  if (!value?.trim()) return null

  try {
    const url = new URL(value)
    const isAllowedCheckout =
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      MERCADO_PAGO_CHECKOUT_HOSTS.has(url.hostname.toLowerCase()) &&
      url.pathname === '/checkout/v1/redirect' &&
      !!url.searchParams.get('pref_id')

    return isAllowedCheckout ? url.href : null
  } catch {
    return null
  }
}
