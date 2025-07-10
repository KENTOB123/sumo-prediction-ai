import { usePayment } from '../contexts/PaymentContext';
import { Check, Crown } from 'lucide-react';

const Payment = () => {
  const { plans, isLoading, createPaymentSession } = usePayment();

  const handleSubscribe = async (planId: string) => {
    try {
      await createPaymentSession(planId);
    } catch (error) {
      console.error('支払いエラー:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">プレミアムプラン</h1>
          <p className="text-gray-600">すべての予測にアクセスして、相撲予測を楽しみましょう</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 無料プラン */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">無料プラン</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ¥0<span className="text-lg text-gray-500">/月</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>月3力士の予測閲覧</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>基本的な統計情報</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>力士一覧閲覧</span>
                </li>
              </ul>
              <button className="w-full py-3 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50">
                現在のプラン
              </button>
            </div>
          </div>

          {/* プレミアムプラン */}
          <div className="bg-white rounded-lg shadow-md p-8 border-2 border-red-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                おすすめ
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">プレミアムプラン</h3>
              <div className="text-3xl font-bold text-red-600 mb-4">
                ¥980<span className="text-lg text-gray-500">/月</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>全力士の予測閲覧</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>詳細な統計分析</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>AI予測の詳細解説</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>優先サポート</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>広告なし</span>
                </li>
              </ul>
              <button 
                onClick={() => handleSubscribe('premium')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '処理中...' : 'プレミアムにアップグレード'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            いつでもキャンセル可能です。お支払い情報は安全に保護されます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment; 