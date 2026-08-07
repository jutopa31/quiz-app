import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../../services/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  /** True when the user never signed in: a device-local identity, not a Supabase account. */
  isAnonymous: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_USER_KEY = 'quiz-app:local-user-id'

function localAnonymousUser(): User {
  let id = localStorage.getItem(LOCAL_USER_KEY)
  if (!id) {
    id = `local-user-${Math.random().toString(36).slice(2, 12)}`
    localStorage.setItem(LOCAL_USER_KEY, id)
  }
  return { id, email: 'Invitado', app_metadata: {}, user_metadata: {}, aud: 'local', created_at: new Date().toISOString() } as User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Quizzes are playable without an account: with no session we fall back to a
    // device-local identity and attempts land in localStorage.
    if (!isSupabaseConfigured) {
      setUser(localAnonymousUser())
      setLoading(false)
      return
    }

    // Helper to clear all auth state
    const clearAuthState = () => {
      setSession(null)
      setUser(null)
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
      setUser(localAnonymousUser())
    }

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          // Clear invalid session
          console.warn('Session error, clearing auth state:', error.message)
          clearAuthState()
        } else {
          setSession(session)
          setUser(session?.user ?? localAnonymousUser())
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to get session:', err)
        clearAuthState()
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh failed, drop back to the guest identity
          setSession(null)
          setUser(localAnonymousUser())
        } else {
          setSession(session)
          setUser(session?.user ?? localAnonymousUser())
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setUser(localAnonymousUser())
      return { error: null }
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error: error as Error | null }
  }

  const signOut = async () => {
    // Signing out returns to the guest identity, not to a locked app
    setSession(null)
    setUser(localAnonymousUser())
    if (!isSupabaseConfigured) return
    // Clear any stale Supabase tokens from localStorage BEFORE calling signOut
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key)
      }
    })
    // Try to sign out with local scope (doesn't require server validation)
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      // Ignore errors - we already cleared local storage
      console.warn('SignOut API error (ignored):', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isAnonymous: !session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
