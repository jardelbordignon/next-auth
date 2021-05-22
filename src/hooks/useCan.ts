import { useContext } from 'react'

import { AuthContext } from '../context/AuthContext'

interface UseCanProps {
  permissions?: string[]
  roles?: string[]
}

export function useCan({ permissions, roles }: UseCanProps) {
  const { user, isAuthenticated } = useContext(AuthContext)

  if (!isAuthenticated) return false

  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every(p => user.permissions.includes(p))

    if (!hasAllPermissions) return false
  }
  
  if (!roles) return false

  return true
}
