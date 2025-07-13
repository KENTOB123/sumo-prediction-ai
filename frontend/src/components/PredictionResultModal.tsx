import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  winProbability: number;
  tournament: string;
  day: number;
}

interface PredictionResultModalProps {
  prediction: Prediction | null;
  isOpen: boolean;
  onClose: () => void;
  onResultRecorded: () => void;
}

const PredictionResultModal: React.FC<PredictionResultModalProps> = ({
  prediction,
  isOpen,
  onClose,
  onResultRecorded
}) => {
  const { token } = useAuth();
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !prediction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWinner) {
      setError('勝者を選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/predictions/${prediction.id}/result`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actualWinnerId: selectedWinner
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '結果の記録に失敗しました');
      }

      onResultRecorded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const isCorrect = selectedWinner === prediction.winner.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">予測結果の記録</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            {prediction.tournament} {prediction.day}日目
          </div>
          <div className="text-lg font-medium text-gray-900 mb-2">
            {prediction.winner.shikona} vs {prediction.loser.shikona}
          </div>
          <div className="text-sm text-gray-600">
            予測勝率: {(prediction.winProbability * 100).toFixed(1)}%
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              実際の勝者を選択
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="winner"
                  value={prediction.winner.id}
                  checked={selectedWinner === prediction.winner.id}
                  onChange={(e) => setSelectedWinner(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">{prediction.winner.shikona}</div>
                  <div className="text-sm text-gray-500">{prediction.winner.name}</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="winner"
                  value={prediction.loser.id}
                  checked={selectedWinner === prediction.loser.id}
                  onChange={(e) => setSelectedWinner(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">{prediction.loser.shikona}</div>
                  <div className="text-sm text-gray-500">{prediction.loser.name}</div>
                </div>
              </label>
            </div>
          </div>

          {selectedWinner && (
            <div className="mb-4 p-3 rounded-lg bg-gray-50">
              <div className="text-sm text-gray-600 mb-1">予測結果:</div>
              <div className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '✅ 的中' : '❌ 外れ'}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!selectedWinner || loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '記録中...' : '結果を記録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PredictionResultModal; 