import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Prediction {
  id: string;
  winner: {
    id: string;
    name: string;
    shikona: string;
  };
  loser: {
    id: string;
    name: string;
    shikona: string;
  };
  actualWinner?: {
    id: string;
    name: string;
    shikona: string;
  };
  winProbability: number;
  confidence: number;
  tournament: string;
  day: number;
  isCorrect?: boolean;
  resultRecordedAt?: string;
  createdAt: string;
}

interface PredictionHistoryResponse {
  predictions: Prediction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const PredictionHistory: React.FC = () => {
  const { token } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPredictions();
  }, [currentPage, token]);

  const fetchPredictions = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/predictions/history?page=${currentPage}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('予測履歴の取得に失敗しました');
      }

      const data: PredictionHistoryResponse = await response.json();
      setPredictions(data.predictions);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (prediction: Prediction) => {
    if (!prediction.resultRecordedAt) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">未確定</span>;
    }
    
    if (prediction.isCorrect) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">的中</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">外れ</span>;
    }
  };

  const getAccuracyColor = (probability: number) => {
    if (probability >= 0.7) return 'text-green-600';
    if (probability >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
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
          <h1 className="text-3xl font-bold text-gray-900">予測履歴</h1>
          <p className="mt-2 text-gray-600">あなたの過去の予測と結果を確認できます</p>
        </div>

        {predictions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">予測履歴がありません</h3>
            <p className="text-gray-600">最初の予測を作成してみましょう</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {predictions.map((prediction) => (
                  <li key={prediction.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {prediction.winner.shikona}
                              </span>
                              <span className="text-gray-500">vs</span>
                              <span className="font-medium text-gray-900">
                                {prediction.loser.shikona}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              {prediction.tournament} {prediction.day}日目
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`font-semibold ${getAccuracyColor(prediction.winProbability)}`}>
                              {(prediction.winProbability * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              信頼度: {(prediction.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                          
                          <div className="text-center">
                            {getResultBadge(prediction)}
                          </div>
                        </div>
                        
                        {prediction.resultRecordedAt && prediction.actualWinner && (
                          <div className="mt-2 text-sm text-gray-600">
                            実際の勝者: {prediction.actualWinner.shikona}
                          </div>
                        )}
                        
                        <div className="mt-1 text-xs text-gray-400">
                          {format(new Date(prediction.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    前へ
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PredictionHistory; 