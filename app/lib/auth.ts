const TOKEN_KEY = "token"
const USER_ID_KEY = "userId"

export function setAuth(token: string, userId: number): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_ID_KEY, String(userId))
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_ID_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUserId(): number | null {
  const id = localStorage.getItem(USER_ID_KEY)
  return id ? Number(id) : null
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken()

  if (!token) {
    return { "Content-Type": "application/json" }
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return fetch(url, { ...options, headers })
}
