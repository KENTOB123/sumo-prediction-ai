import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">支払い完了</h1>
        <p className="text-gray-600 mb-6">
          プレミアムプランの登録が完了しました！
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          ダッシュボードへ
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess; 