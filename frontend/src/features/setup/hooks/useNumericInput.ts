import { useCallback } from 'react'

interface UseNumericInputOptions {
  allowHyphen?: boolean
  allowPhone?: boolean
}

export function useNumericInput(options: UseNumericInputOptions = {}) {
  const { allowHyphen = false, allowPhone = false } = options

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const controlKeys = [
        'Backspace',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Delete',
        'Home',
        'End',
        'Enter',
      ]
      if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) return

      let allowed: RegExp
      if (allowPhone) {
        allowed = /[0-9+\-() ]/
      } else if (allowHyphen) {
        allowed = /[0-9-]/
      } else {
        allowed = /[0-9]/
      }

      if (!allowed.test(e.key)) {
        e.preventDefault()
      }
    },
    [allowHyphen, allowPhone],
  )

  const sanitize = useCallback(
    (value: string) => {
      if (allowPhone) {
        return value.replace(/[^0-9+\-() ]/g, '')
      }
      if (allowHyphen) {
        return value.replace(/[^0-9-]/g, '')
      }
      return value.replace(/[^0-9]/g, '')
    },
    [allowHyphen, allowPhone],
  )

  return { onKeyDown, sanitize }
}
