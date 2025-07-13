import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, Target, Award, Calendar, Users, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Rikishi {
  id: string;
  shikona: string;
  rank: string;
  stable: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  preferred_kimarite: string[];
  career_record: { wins: number; losses: number; draws: number };
  yusho: number;
  special_prizes: { gino: number; kanto: number; shukun: number };
  kinboshi: number;
  last_3_basho: Array<{ basho: string; wins: number; losses: number }>;
  current_streak: { type: string; value: number };
  elo: number;
  head2head_vs_next?: { wins: number; losses: number };
  injury_status: string;
}

interface Prediction {
  id: string;
  winner: Rikishi;
  loser: Rikishi;
  winProbability: number;
  confidence: number;
  tournament: string;
  day: number;
  createdAt: string;
}

const Predictions = () => {
  const { user, token } = useAuth();
  const [rikishi, setRikishi] = useState<Rikishi[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [selectedLoser, setSelectedLoser] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'predictions' | 'history' | 'stats'>('predictions');

  useEffect(() => {
    fetchRikishi();
    fetchPredictions();
  }, []);

  const fetchRikishi = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/rikishi', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRikishi(data);
      }
    } catch (error) {
      console.error('力士データ取得エラー:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/predictions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPredictions(data);
      }
    } catch (error) {
      console.error('予測データ取得エラー:', error);
    }
  };

  const handlePrediction = async () => {
    if (!selectedWinner || !selectedLoser) {
      toast.error('勝者と敗者を選択してください');
      return;
    }

    if (selectedWinner === selectedLoser) {
      toast.error('異なる力士を選択してください');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId: selectedWinner,
          loserId: selectedLoser,
          tournament: '2025.07',
          day: 1
        }),
      });

      if (response.ok) {
        const prediction = await response.json();
        toast.success('予測を作成しました！');
        setPredictions(prev => [prediction, ...prev]);
        setSelectedWinner('');
        setSelectedLoser('');
      } else {
        const error = await response.json();
        toast.error(error.error || '予測作成に失敗しました');
      }
    } catch (error) {
      toast.error('予測作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Y': return 'bg-yellow-500';
      case 'O': return 'bg-red-500';
      case 'S': return 'bg-purple-500';
      case 'K': return 'bg-blue-500';
      case 'M': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getWinRate = (record: { wins: number; losses: number }) => {
    const total = record.wins + record.losses;
    return total > 0 ? ((record.wins / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">相撲AI予測</h1>
              <p className="text-gray-600">AIが分析する相撲の勝敗予測</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">ようこそ</p>
                <p className="font-medium">{user?.name}さん</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('predictions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'predictions'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Target className="inline-block w-4 h-4 mr-2" />
              予測作成
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="inline-block w-4 h-4 mr-2" />
              予測履歴
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="inline-block w-4 h-4 mr-2" />
              統計
            </button>
          </nav>
        </div>

        {/* 予測作成タブ */}
        {activeTab === 'predictions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 予測フォーム */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">新しい予測</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      勝者を選択
                    </label>
                    <select
                      value={selectedWinner}
                      onChange={(e) => setSelectedWinner(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">選択してください</option>
                      {rikishi.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.shikona} ({r.rank})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      敗者を選択
                    </label>
                    <select
                      value={selectedLoser}
                      onChange={(e) => setSelectedLoser(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">選択してください</option>
                      {rikishi.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.shikona} ({r.rank})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handlePrediction}
                    disabled={isLoading || !selectedWinner || !selectedLoser}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '予測中...' : '予測を作成'}
                  </button>
                </div>
              </div>
            </div>

            {/* 力士一覧 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold">力士一覧</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          力士
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          階級
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          成績
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ELO
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          連続
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rikishi.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {r.shikona.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {r.shikona}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {r.stable}部屋
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getRankColor(r.rank)}`}>
                              {r.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {r.career_record.wins}勝{r.career_record.losses}敗
                            <br />
                            <span className="text-gray-500">
                              ({getWinRate(r.career_record)}%)
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {r.elo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {r.current_streak.type === 'W' ? (
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                              )}
                              <span className="text-sm text-gray-900">
                                {r.current_streak.value}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 予測履歴タブ */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">予測履歴</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      対戦
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      勝率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      信頼度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      場所・日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.map((prediction) => (
                    <tr key={prediction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {prediction.winner.shikona} vs {prediction.loser.shikona}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(prediction.winProbability * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prediction.tournament} {prediction.day}日目
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(prediction.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 統計タブ */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      総予測数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {predictions.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      的中率
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      --%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      現在の連続
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      --
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      登録力士数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {rikishi.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions; 