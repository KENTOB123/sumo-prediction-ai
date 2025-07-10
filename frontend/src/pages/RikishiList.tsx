import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Trophy, TrendingUp } from 'lucide-react';

interface Rikishi {
  id: number;
  name: string;
  rank: string;
  stable: string;
  wins: number;
  losses: number;
  winRate: number;
  imageUrl?: string;
}

const RikishiList = () => {
  const [rikishi, setRikishi] = useState<Rikishi[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('all');

  useEffect(() => {
    // ダミーデータ
    setRikishi([
      {
        id: 1,
        name: '照ノ富士',
        rank: '横綱',
        stable: '伊勢ヶ濱部屋',
        wins: 15,
        losses: 0,
        winRate: 100,
      },
      {
        id: 2,
        name: '大栄翔',
        rank: '大関',
        stable: '追手風部屋',
        wins: 12,
        losses: 3,
        winRate: 80,
      },
      {
        id: 3,
        name: '貴景勝',
        rank: '関脇',
        stable: '佐渡ヶ嶽部屋',
        wins: 11,
        losses: 4,
        winRate: 73.3,
      },
      {
        id: 4,
        name: '正代',
        rank: '関脇',
        stable: '追手風部屋',
        wins: 10,
        losses: 5,
        winRate: 66.7,
      },
      {
        id: 5,
        name: '霧島',
        rank: '小結',
        stable: '佐渡ヶ嶽部屋',
        wins: 9,
        losses: 6,
        winRate: 60,
      },
      {
        id: 6,
        name: '豊昇龍',
        rank: '前頭',
        stable: '追手風部屋',
        wins: 8,
        losses: 7,
        winRate: 53.3,
      },
    ]);
  }, []);

  const filteredRikishi = rikishi.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.stable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = rankFilter === 'all' || r.rank === rankFilter;
    return matchesSearch && matchesRank;
  });

  const getRankColor = (rank: string) => {
    switch (rank) {
      case '横綱': return 'text-yellow-600 bg-yellow-100';
      case '大関': return 'text-purple-600 bg-purple-100';
      case '関脇': return 'text-blue-600 bg-blue-100';
      case '小結': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">力士一覧</h1>
          <p className="text-gray-600 mt-2">
            現在活躍中の力士たちの情報をご覧ください
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
                  placeholder="力士名または部屋名で検索..."
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
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
              >
                <option value="all">すべての階級</option>
                <option value="横綱">横綱</option>
                <option value="大関">大関</option>
                <option value="関脇">関脇</option>
                <option value="小結">小結</option>
                <option value="前頭">前頭</option>
              </select>
            </div>
          </div>
        </div>

        {/* 力士一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRikishi.map((r) => (
            <Link key={r.id} to={`/rikishi/${r.id}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRankColor(r.rank)}`}>
                      {r.rank}
                    </span>
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{r.winRate}%</span>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
                    <h3 className="text-lg font-bold text-gray-900">{r.name}</h3>
                    <p className="text-sm text-gray-500">{r.stable}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">勝敗</span>
                      <span className="font-medium">
                        {r.wins}勝{r.losses}敗
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">勝率</span>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="font-medium">{r.winRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${r.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredRikishi.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当する力士が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RikishiList; 