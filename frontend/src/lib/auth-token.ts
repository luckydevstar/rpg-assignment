import { computed, ref } from 'vue'

const TOKEN_KEY = 'blog_auth_token'
const USER_KEY = 'blog_auth_user'

export type AuthUser = { id: string; email: string }

/** Reactive token for Vue (also persisted in localStorage). */
export const authTokenRef = ref<string | null>(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem(TOKEN_KEY)
    : null,
)

function readStoredUser(): AuthUser | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (parsed?.id && parsed?.email) return parsed
    return null
  } catch {
    return null
  }
}

/** Reactive signed-in profile (id + email). */
export const authUserRef = ref<AuthUser | null>(readStoredUser())

export function getStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredUser(user: AuthUser | null): void {
  authUserRef.value = user
  if (typeof localStorage === 'undefined') return
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function setStoredToken(token: string | null): void {
  authTokenRef.value = token
  if (typeof localStorage === 'undefined') return
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    return
  }
  localStorage.removeItem(TOKEN_KEY)
  setStoredUser(null)
}

/** Display label: part before @, or full email. */
export function userDisplayLabel(email: string): string {
  const i = email.indexOf('@')
  return i > 0 ? email.slice(0, i) : email
}

/** First letter for avatar chip. */
export function userInitialFromEmail(email: string): string {
  const label = userDisplayLabel(email)
  const c = label.trim().charAt(0)
  return c ? c.toUpperCase() : '?'
}

/** Whether we have a token but no profile yet (e.g. new tab); fetch `me`. */
export const needsUserProfile = computed(
  () => !!authTokenRef.value && !authUserRef.value,
)
