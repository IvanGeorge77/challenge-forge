import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import api from '../lib/api'

interface AuthContextType {
  isLoaded: boolean
  isSignedIn: boolean
  userId: string | null | undefined
  userName: string | null | undefined
  userEmail: string | null | undefined
  userImageUrl: string | null | undefined
}

const AuthContext = createContext<AuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  userId: null,
  userName: null,
  userEmail: null,
  userImageUrl: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user } = useUser()

  // Wire the Clerk token getter into the API client
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      api.setTokenGetter(() => getToken())
    }
  }, [isLoaded, isSignedIn, getToken])

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn: !!isSignedIn,
        userId: user?.id,
        userName: user?.fullName || user?.firstName,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userImageUrl: user?.imageUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
