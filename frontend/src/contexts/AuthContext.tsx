import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  isPremium: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)
  const queryClient = useQueryClient()

  // APIクライアントの設定
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // トークンが変更されたときにヘッダーを更新
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  // ユーザー情報の取得
  const { isLoading } = useQuery(
    ['user', token],
    async () => {
      if (!token) return null
      const response = await api.get('/auth/me')
      return response.data.user
    },
    {
      enabled: !!token,
      onSuccess: (data) => {
        setUser(data)
      },
      onError: () => {
        logout()
      },
    }
  )

  // ログイン
  const loginMutation = useMutation(
    async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    },
    {
      onSuccess: (data) => {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        toast.success('ログインに成功しました')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'ログインに失敗しました')
      },
    }
  )

  // 登録
  const registerMutation = useMutation(
    async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const response = await api.post('/auth/register', { email, password, name })
      return response.data
    },
    {
      onSuccess: (data) => {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        toast.success('登録が完了しました')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || '登録に失敗しました')
      },
    }
  )

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }

  const register = async (email: string, password: string, name: string) => {
    await registerMutation.mutateAsync({ email, password, name })
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    queryClient.clear()
    toast.success('ログアウトしました')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading: isLoading || loginMutation.isLoading || registerMutation.isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 