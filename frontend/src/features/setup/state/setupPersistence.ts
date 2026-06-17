import type { PersistedIds } from './setupTypes'
import { makeDefaultPersistedIds } from './setupTypes'

const STORAGE_KEY = 'setup-wizard-progress'

export interface WizardProgress {
  currentStep: number
  ids: PersistedIds
  userId?: number
}

export function saveWizardProgress(progress: WizardProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage puede fallar en modo privado o con storage lleno
  }
}

export function loadWizardProgress(userId?: number): WizardProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WizardProgress
    if (userId !== undefined && parsed.userId !== undefined && parsed.userId !== userId) {
      clearWizardProgress()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearWizardProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // silencioso
  }
}

export function makeDefaultProgress(userId?: number): WizardProgress {
  return {
    currentStep: 0,
    ids: makeDefaultPersistedIds(),
    userId,
  }
}
