import { useAuth } from '../components/auth/AuthProvider'
import { isAdmin } from '../services/adminService'

export function useAdmin() {
  const { user } = useAuth()
  return { isAdmin: isAdmin(user?.email) }
}
