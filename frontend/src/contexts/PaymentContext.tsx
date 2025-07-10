import React, { createContext, useContext, ReactNode } from 'react'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  features: string[]
}

interface PaymentContextType {
  plans: Plan[]
  isLoading: boolean
  isPremium: boolean
  createPaymentSession: (planId: string) => Promise<void>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export const usePayment = () => {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}

interface PaymentProviderProps {
  children: ReactNode
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  // プラン情報の取得
  const { data: plans = [], isLoading } = useQuery(
    'plans',
    async () => {
      const response = await axios.get('/api/payments/plans')
      return response.data
    },
    {
      staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    }
  )

  // 支払いセッションの作成
  const createSessionMutation = useMutation(
    async (planId: string) => {
      const response = await axios.post('/api/payments/create-session', { planId })
      return response.data
    },
    {
      onSuccess: (data) => {
        // Stripeのチェックアウトページにリダイレクト
        window.location.href = data.url
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || '支払いセッションの作成に失敗しました')
      },
    }
  )

  const createPaymentSession = async (planId: string) => {
    await createSessionMutation.mutateAsync(planId)
  }

  const value: PaymentContextType = {
    plans,
    isLoading: isLoading || createSessionMutation.isLoading,
    isPremium: false, // ダミー値（実際のAPIから取得）
    createPaymentSession,
  }

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
} 