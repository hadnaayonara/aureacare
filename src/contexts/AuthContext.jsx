import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        try {
          setError(null)
          
          if (session?.user) {
            setUser(session.user)
            await fetchUserProfile(session.user.id)
          } else {
            setUser(null)
            setUserProfile(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setError(error.message)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        // Se não encontrar perfil, criar um básico
        if (error.code === 'PGRST116') {
          await createUserProfile(userId)
        }
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    }
  }

  const createUserProfile = async (userId) => {
    try {
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser?.user) return

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.full_name || '',
          app_role: 'host' // Default role
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error in createUserProfile:', error)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setError(error.message)
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        setError(error.message)
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
        throw error
      }
      
      setUser(null)
      setUserProfile(null)
      
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        setError(error.message)
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        setError(error.message)
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        setError(error.message)
        throw error
      }
      
      setUserProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    try {
      if (!user) throw new Error('No user logged in')
      
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      })
      
      if (error) {
        setError(error.message)
        throw error
      }
      
      return { error: null }
    } catch (error) {
      console.error('Resend verification error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    resendVerification,
    isAuthenticated: !!user,
    isEmailVerified: user?.email_confirmed_at ? true : false,
    isAdmin: userProfile?.app_role === 'admin',
    isHost: userProfile?.app_role === 'host',
    isReception: userProfile?.app_role === 'reception',
    isDoctor: userProfile?.app_role === 'doctor'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
