import { UserRole } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: UserRole
      department?: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    role: UserRole
    department?: string
  }
}