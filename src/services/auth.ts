import type { User, LoginCredentials, RegisterData } from '@/types/auth'
import { hashPassword, verifyPassword } from '@/utils/crypto'

const API_BASE_URL = 'http://localhost:3000'

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users?email=${credentials.email}`)

  if (!response.ok) {
    throw new Error('Error conectando al servidor. Intenta más tarde.')
  }

  const users: User[] = await response.json()
  const user = users.find((u) => u.email === credentials.email)

  if (!user) {
    throw new Error('El email no está registrado')
  }

  const isValid = await verifyPassword(credentials.password, user.password)
  if (!isValid) {
    throw new Error('Contraseña incorrecta')
  }

  return user
}

export async function register(data: RegisterData): Promise<User> {
  const checkResponse = await fetch(`${API_BASE_URL}/users?email=${data.email}`)

  if (!checkResponse.ok) {
    throw new Error('Error conectando al servidor. Intenta más tarde.')
  }

  const existingUsers: User[] = await checkResponse.json()

  if (existingUsers.length > 0) {
    throw new Error('El email ya está registrado')
  }

  const hashedPassword = await hashPassword(data.password)

  const createResponse = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: hashedPassword
    })
  })

  if (!createResponse.ok) {
    throw new Error('Error al crear el usuario. Intenta más tarde.')
  }

  const newUser: User = await createResponse.json()
  return newUser
}
