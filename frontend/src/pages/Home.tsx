import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Users, TrendingUp, Shield, Zap, Target } from 'lucide-react'

const Home: React.FC = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: Brain,
      title: 'AI予測',
      description: '最新の機械学習技術を使用して、力士の対戦結果を高精度で予測します。'
    },
    {
      icon: Users,
      title: '力士データ',
      description: '全力士の詳細な情報、対戦成績、統計データを提供します。'
    },
    {
      icon: TrendingUp,
      title: '分析機能',
      description: '過去の対戦データを分析し、勝率の傾向を可視化します。'
    },
    {
      icon: Shield,
      title: '信頼性',
      description: '豊富なデータと高度なアルゴリズムによる信頼性の高い予測。'
    }
  ]

  const plans = [
    {
      name: '無料プラン',
      price: '0円',
      features: [
        '月3力士の予測閲覧',
        '基本的な力士情報',
        '過去の対戦成績'
      ],
      buttonText: '無料で始める',
      buttonLink: '/register'
    },
    {
      name: 'プレミアムプラン',
      price: '980円/月',
      features: [
        '全力士のAI予測閲覧',
        '詳細な分析データ',
        '優先サポート',
        '高度な統計情報'
      ],
      buttonText: 'プレミアムにアップグレード',
      buttonLink: '/payment',
      highlighted: true
    }
  ]

  return (
    <div className="space-y-16">
      {/* ヒーローセクション */}
      <section className="text-center py-20 bg-gradient-to-br from-sumo-red to-red-800 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            AIが予測する相撲の未来
          </h1>
          <p className="text-xl mb-8 text-red-100">
            力士の対戦成績、体調、相性をAIが分析し、勝利の期待値を算出します。
            相撲ファン必見の予測アプリケーションです。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/predictions" className="btn-primary bg-white text-sumo-red hover:bg-gray-100">
                予測を見る
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary bg-white text-sumo-red hover:bg-gray-100">
                  無料で始める
                </Link>
                <Link to="/login" className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-sumo-red">
                  ログイン
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-sumo-red rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* プラン比較 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">プラン比較</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`card ${plan.highlighted ? 'ring-2 ring-sumo-red' : ''}`}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-sumo-red mb-4">
                    {plan.price}
                  </div>
                  <ul className="space-y-2 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Target className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={plan.buttonLink}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      plan.highlighted
                        ? 'bg-sumo-red text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            今すぐ相撲予測を始めよう
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            AIの力で相撲の世界をより深く楽しみましょう
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-4">
            <Zap className="w-5 h-5 mr-2" />
            無料で始める
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home 