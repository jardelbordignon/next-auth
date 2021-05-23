interface User {
  permissions: string[]
  roles: string[]
}

interface ValidateUserPermissionsParams {
  user: User
  permissions?: string[]
  roles?: string[]
}

export function validateUserPermissions({
  user,
  permissions,
  roles
}: ValidateUserPermissionsParams) {

  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every(p => user.permissions.includes(p))

    if (!hasAllPermissions) return false
  }
  
  if (!roles) return false

  return true
}
