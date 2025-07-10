import { useParams } from 'react-router-dom';

const RikishiDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">力士詳細</h1>
          <p className="text-gray-600">力士ID: {id}</p>
          <p className="text-gray-600 mt-4">このページは開発中です。</p>
        </div>
      </div>
    </div>
  );
};

export default RikishiDetail; 