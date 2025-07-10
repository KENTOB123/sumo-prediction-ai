import { Link } from 'react-router-dom';
import { XCircle, ArrowRight } from 'lucide-react';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">支払いキャンセル</h1>
        <p className="text-gray-600 mb-6">
          支払いがキャンセルされました。後で再度お試しください。
        </p>
        <Link
          to="/payment"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          支払いページへ戻る
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel; 