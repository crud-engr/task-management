export type UserRole = 'admin' | 'member'

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: UserRole
}
