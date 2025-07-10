import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Crown, Home, Users, BarChart3, LogOut, LogIn, UserPlus } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'ホーム', href: '/', icon: Home },
    { name: '力士一覧', href: '/rikishi', icon: Users },
    ...(user ? [
      { name: 'ダッシュボード', href: '/dashboard', icon: BarChart3 },
      { name: '予測', href: '/predictions', icon: BarChart3 },
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* ロゴ */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-sumo-red rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">相</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">SUmo</span>
                </Link>
              </div>

              {/* ナビゲーションリンク */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-sumo-red text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* ユーザーメニュー */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {user.isPremium && (
                    <div className="flex items-center text-sumo-gold">
                      <Crown className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">プレミアム</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">{user.name}</span>
                    <button
                      onClick={logout}
                      className="flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    ログイン
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    登録
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 SUmo. 相撲予測AIアプリケーション</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout 