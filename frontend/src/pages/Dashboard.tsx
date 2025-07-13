import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import { 
  Trophy, 
  TrendingUp, 
  Crown,
  Star,
  ArrowRight,
  Zap
} from 'lucide-react';

interface Prediction {
  id: number;
  rikishi1: string;
  rikishi2: string;
  prediction: string;
  result: string;
  date: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { isPremium } = usePayment();
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState({
    totalPredictions: 0,
    accuracy: 0,
    winStreak: 0
  });

  useEffect(() => {
    // ダミーデータ（実際のAPIから取得）
    setRecentPredictions([
      { id: 1, rikishi1: '照ノ富士', rikishi2: '大栄翔', prediction: '照ノ富士', result: 'win', date: '2024-01-15' },
      { id: 2, rikishi1: '貴景勝', rikishi2: '正代', prediction: '正代', result: 'loss', date: '2024-01-14' },
      { id: 3, rikishi1: '霧島', rikishi2: '豊昇龍', prediction: '霧島', result: 'win', date: '2024-01-13' },
    ]);

    setStats({
      totalPredictions: 45,
      accuracy: 78,
      winStreak: 5
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ようこそ、{user?.name}さん！
          </h1>
          <p className="text-gray-600 mt-2">
            今日の相撲予測をチェックしましょう
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総予測数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPredictions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">的中率</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">連勝記録</p>
                <p className="text-2xl font-bold text-gray-900">{stats.winStreak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 今日の予測 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">今日の予測</h2>
                <Link 
                  to="/predictions" 
                  className="text-red-600 hover:text-red-700 font-medium flex items-center"
                >
                  すべて見る
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {isPremium ? (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">第1試合</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">AI予測</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                        <p className="font-medium">照ノ富士</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-400">VS</p>
                        <p className="text-xs text-gray-500">勝率: 65%</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                        <p className="font-medium">大栄翔</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">予測: <span className="font-bold text-red-600">照ノ富士</span></p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">第2試合</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">AI予測</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                        <p className="font-medium">貴景勝</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-400">VS</p>
                        <p className="text-xs text-gray-500">勝率: 58%</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                        <p className="font-medium">正代</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">予測: <span className="font-bold text-red-600">正代</span></p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    プレミアム会員限定
                  </h3>
                  <p className="text-gray-600 mb-4">
                    今日の予測をすべて見るには、プレミアム会員にアップグレードしてください
                  </p>
                  <Link
                    to="/payment"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    プレミアムにアップグレード
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 最近の予測結果 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">最近の予測結果</h3>
              <div className="space-y-3">
                {recentPredictions.map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {prediction.rikishi1} vs {prediction.rikishi2}
                      </p>
                      <p className="text-xs text-gray-500">{prediction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{prediction.prediction}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        prediction.result === 'win' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {prediction.result === 'win' ? '的中' : '外れ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 力士ランキング */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">力士ランキング</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-yellow-600 mr-3">1</span>
                    <div>
                      <p className="font-medium">照ノ富士</p>
                      <p className="text-xs text-gray-500">横綱</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">15勝0敗</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-400 mr-3">2</span>
                    <div>
                      <p className="font-medium">大栄翔</p>
                      <p className="text-xs text-gray-500">大関</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">12勝3敗</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-orange-600 mr-3">3</span>
                    <div>
                      <p className="font-medium">貴景勝</p>
                      <p className="text-xs text-gray-500">関脇</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">11勝4敗</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 