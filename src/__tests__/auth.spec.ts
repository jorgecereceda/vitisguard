import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  register: vi.fn()
}))

import { login as loginService, register as registerService } from '@/services/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initial state has no user and not authenticated', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('login successful saves user and sets authenticated', async () => {
    const mockUser = { id: '1', name: 'Test', email: 'test@test.com', password: 'pass123' }
    vi.mocked(loginService).mockResolvedValue(mockUser)

    const store = useAuthStore()
    await store.login('test@test.com', 'pass123')

    expect(store.user).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
    expect(store.error).toBeNull()
  })

  it('login failed sets error message', async () => {
    vi.mocked(loginService).mockRejectedValue(new Error('Invalid credentials'))

    const store = useAuthStore()
    await expect(store.login('wrong@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
    expect(store.error).toBe('Invalid credentials')
    expect(store.isAuthenticated).toBe(false)
  })

  it('logout clears user and removes from localStorage', async () => {
    const mockUser = { id: '1', name: 'Test', email: 'test@test.com', password: 'pass123' }
    vi.mocked(loginService).mockResolvedValue(mockUser)

    const store = useAuthStore()
    await store.login('test@test.com', 'pass123')
    expect(store.isAuthenticated).toBe(true)

    store.logout()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('vitisguard_user')).toBeNull()
  })

  it('persists user to localStorage on login (without password)', async () => {
    const mockUser = { id: '1', name: 'Test', email: 'test@test.com', password: 'pass123' }
    vi.mocked(loginService).mockResolvedValue(mockUser)

    const store = useAuthStore()
    await store.login('test@test.com', 'pass123')

    const stored = localStorage.getItem('vitisguard_user')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.password).toBeUndefined()
    expect(parsed.name).toBe('Test')
  })

  it('loads user from localStorage on initialization', () => {
    const storedUser = { id: '1', name: 'Stored', email: 'stored@test.com' }
    localStorage.setItem('vitisguard_user', JSON.stringify(storedUser))

    const store = useAuthStore()
    expect(store.user).toEqual(storedUser)
    expect(store.isAuthenticated).toBe(true)
  })

  it('register calls service and handles errors', async () => {
    vi.mocked(registerService).mockResolvedValue({ id: '2', name: 'New', email: 'new@test.com', password: 'pass' })

    const store = useAuthStore()
    await store.register('New', 'new@test.com', 'pass')

    expect(registerService).toHaveBeenCalledWith({ name: 'New', email: 'new@test.com', password: 'pass' })
  })

  it('register failed sets error message', async () => {
    vi.mocked(registerService).mockRejectedValue(new Error('Email already exists'))

    const store = useAuthStore()
    await expect(store.register('Test', 'exists@test.com', 'pass')).rejects.toThrow('Email already exists')
    expect(store.error).toBe('Email already exists')
  })

  it('clearError clears the error state', async () => {
    vi.mocked(loginService).mockRejectedValue(new Error('Error'))

    const store = useAuthStore()
    await expect(store.login('test@test.com', 'pass')).rejects.toThrow('Error')
    expect(store.error).not.toBeNull()

    store.clearError()
    expect(store.error).toBeNull()
  })
})
