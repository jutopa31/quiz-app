const ADMIN_EMAIL = 'julian.martin.alonso@gmail.com'

export function isAdmin(email?: string | null) {
  return email === ADMIN_EMAIL
}
