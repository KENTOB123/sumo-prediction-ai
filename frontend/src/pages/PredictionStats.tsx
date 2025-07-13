import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserStats {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  currentStreak: number;
  bestStreak: number;
}

interface RankingUser {
  id: string;
  name: string;
  isPremium: boolean;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  currentStreak: number;
  bestStreak: number;
}

const PredictionStats: React.FC = () => {
  const { token } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchRanking();
    }
  }, [token]);

  const fetchStats = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/predictions/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('統計情報の取得に失敗しました');
      }

      const stats: UserStats = await response.json();
      setUserStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const fetchRanking = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/predictions/ranking?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('ランキングの取得に失敗しました');
      }

      const rankingData = await response.json();
      setRanking(rankingData);
    } catch (err) {
      console.error('ランキング取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.7) return 'text-green-600';
    if (accuracy >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 0.8) return '🏆 エキスパート';
    if (accuracy >= 0.6) return '🥈 上級者';
    if (accuracy >= 0.4) return '🥉 中級者';
    return '📊 初心者';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">予測統計</h1>
          <p className="mt-2 text-gray-600">あなたの予測パフォーマンスを確認できます</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ユーザー統計 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">あなたの統計</h2>
            
            {userStats ? (
              <div className="space-y-6">
                {/* 的中率 */}
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getAccuracyColor(userStats.accuracy)}`}>
                    {(userStats.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">的中率</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getAccuracyBadge(userStats.accuracy)}
                  </div>
                </div>

                {/* 統計カード */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userStats.totalPredictions}
                    </div>
                    <div className="text-sm text-blue-700">総予測数</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userStats.correctPredictions}
                    </div>
                    <div className="text-sm text-green-700">的中数</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userStats.currentStreak}
                    </div>
                    <div className="text-sm text-purple-700">現在の連続的中</div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {userStats.bestStreak}
                    </div>
                    <div className="text-sm text-orange-700">最高連続的中</div>
                  </div>
                </div>

                {/* 進捗バー */}
                {userStats.totalPredictions > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>的中率の進捗</span>
                      <span>{(userStats.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${userStats.accuracy * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <p className="text-gray-600">まだ予測データがありません</p>
              </div>
            )}
          </div>

          {/* ランキング */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">的中率ランキング</h2>
            
            {ranking.length > 0 ? (
              <div className="space-y-4">
                {ranking.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                      index === 1 ? 'bg-gray-50 border border-gray-200' :
                      index === 2 ? 'bg-orange-50 border border-orange-200' :
                      'bg-white border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-500 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                          {user.isPremium && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.totalPredictions}回の予測
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold ${getAccuracyColor(user.accuracy)}`}>
                        {(user.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        連続{user.currentStreak}回
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🏆</div>
                <p className="text-gray-600">ランキングデータがありません</p>
              </div>
            )}
          </div>
        </div>

        {/* ヒント */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">予測精度を向上させるコツ</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• 力士の過去の対戦成績をよく確認する</li>
            <li>• 最近の調子や怪我の有無をチェックする</li>
            <li>• 同じ部屋の力士同士の対戦は特に注目</li>
            <li>• 場所の進行に応じて力士の調子が変わることも</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PredictionStats; 