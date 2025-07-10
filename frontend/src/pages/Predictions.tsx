import { useState, useEffect } from 'react';
import { Calendar, Filter, Search } from 'lucide-react';

interface Prediction {
  id: number;
  rikishi1: string;
  rikishi2: string;
  prediction: string;
  confidence: number;
  date: string;
  time: string;
}

const Predictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // ダミーデータ
    setPredictions([
      {
        id: 1,
        rikishi1: '照ノ富士',
        rikishi2: '大栄翔',
        prediction: '照ノ富士',
        confidence: 85,
        date: '2024-01-15',
        time: '14:30'
      },
      {
        id: 2,
        rikishi1: '貴景勝',
        rikishi2: '正代',
        prediction: '正代',
        confidence: 72,
        date: '2024-01-15',
        time: '15:00'
      },
      {
        id: 3,
        rikishi1: '霧島',
        rikishi2: '豊昇龍',
        prediction: '霧島',
        confidence: 68,
        date: '2024-01-15',
        time: '15:30'
      }
    ]);
  }, []);

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = 
      prediction.rikishi1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prediction.rikishi2.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'high-confidence') return matchesSearch && prediction.confidence >= 80;
    if (filter === 'medium-confidence') return matchesSearch && prediction.confidence >= 60 && prediction.confidence < 80;
    if (filter === 'low-confidence') return matchesSearch && prediction.confidence < 60;
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">今日の予測</h1>
          <p className="text-gray-600 mt-2">
            AIが分析した相撲の勝敗予測をご覧ください
          </p>
        </div>

        {/* フィルターと検索 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="力士名で検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">すべて</option>
                <option value="high-confidence">高確率 (80%以上)</option>
                <option value="medium-confidence">中確率 (60-79%)</option>
                <option value="low-confidence">低確率 (60%未満)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 予測一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPredictions.map((prediction) => (
            <div key={prediction.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">
                      {prediction.date} {prediction.time}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    prediction.confidence >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : prediction.confidence >= 60 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {prediction.confidence}%確信
                  </span>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <p className="font-medium text-gray-900">{prediction.rikishi1}</p>
                    </div>
                    <div className="text-center mx-4">
                      <p className="text-2xl font-bold text-gray-400">VS</p>
                    </div>
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <p className="font-medium text-gray-900">{prediction.rikishi2}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">AI予測</p>
                  <p className="text-lg font-bold text-red-600">{prediction.prediction}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">勝率予測</span>
                    <span className="font-medium">{prediction.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        prediction.confidence >= 80 
                          ? 'bg-green-500' 
                          : prediction.confidence >= 60 
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPredictions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当する予測が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions; 