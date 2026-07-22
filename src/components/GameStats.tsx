
import React from 'react';
import { BarChart3, TrendingUp, Users, Trophy } from 'lucide-react';

export const GameStats = () => {
  const stats = {
    totalPlayers: 8,
    totalPoints: 14580,
    totalDeals: 215,
    averagePoints: 1822,
    topPerformer: 'Анна Смирнова',
    mostActiveDay: 'Вторник',
    weeklyGrowth: 15
  };

  const weeklyData = [
    { day: 'Пн', deals: 12, points: 1650 },
    { day: 'Вт', deals: 18, points: 2340 },
    { day: 'Ср', deals: 15, points: 1950 },
    { day: 'Чт', deals: 16, points: 2080 },
    { day: 'Пт', deals: 14, points: 1820 },
    { day: 'Сб', deals: 8, points: 1040 },
    { day: 'Вс', deals: 6, points: 780 }
  ];

  const topCategories = [
    { name: 'Залоги', count: 125, points: 18750, color: 'from-blue-400 to-purple-500' },
    { name: 'Почтовые сборы', count: 90, points: 9000, color: 'from-purple-400 to-pink-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Заголовок в стиле Vice City */}
      <div className="vice-card p-8 relative overflow-hidden bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg"></div>
        
        <div className="flex items-center space-x-6 relative z-10">
          <div className="relative">
            <BarChart3 className="h-12 w-12 text-cyan-400 filter drop-shadow-lg" />
            <div className="absolute inset-0 h-12 w-12 text-cyan-400 opacity-50 animate-ping">
              <BarChart3 className="h-12 w-12" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold font-mono tracking-wider text-transparent bg-clip-text vice-gradient neon-text mb-2">
              СТАТИСТИКА ИГРЫ
            </h2>
            <p className="text-cyan-300 font-mono text-lg tracking-wide">Общие показатели отдела продаж</p>
          </div>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="vice-card p-6 relative overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900/50 border-2 border-blue-500/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg neon-glow-blue">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white font-mono filter drop-shadow-lg">{stats.totalPlayers}</div>
              <div className="text-cyan-300 font-mono text-sm tracking-wide">Активных игроков</div>
            </div>
          </div>
        </div>

        <div className="vice-card p-6 relative overflow-hidden bg-gradient-to-br from-gray-900 to-yellow-900/50 border-2 border-yellow-500/50">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="text-white" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white font-mono filter drop-shadow-lg">{stats.totalPoints}</div>
              <div className="text-yellow-300 font-mono text-sm tracking-wide">Всего баллов</div>
            </div>
          </div>
        </div>

        <div className="vice-card p-6 relative overflow-hidden bg-gradient-to-br from-gray-900 to-green-900/50 border-2 border-green-500/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white font-mono filter drop-shadow-lg">{stats.totalDeals}</div>
              <div className="text-green-300 font-mono text-sm tracking-wide">Закрытых сделок</div>
            </div>
          </div>
        </div>

        <div className="vice-card p-6 relative overflow-hidden bg-gradient-to-br from-gray-900 to-purple-900/50 border-2 border-purple-500/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white font-mono filter drop-shadow-lg">{stats.averagePoints}</div>
              <div className="text-purple-300 font-mono text-sm tracking-wide">Средний балл</div>
            </div>
          </div>
        </div>
      </div>

      {/* Недельная активность */}
      <div className="vice-card p-6 relative overflow-hidden bg-gradient-to-br from-gray-900 to-purple-900/50 border-2 border-purple-500/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text vice-gradient font-mono tracking-wide">
            АКТИВНОСТЬ ПО ДНЯМ НЕДЕЛИ
          </h3>
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="flex items-center space-x-4">
                <div className="w-10 text-center text-lg font-bold text-cyan-300 font-mono">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-mono font-semibold">Сделки: {day.deals}</span>
                    <span className="text-green-400 font-mono font-semibold">Баллы: {day.points}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${(day.deals / 18) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Статистика по категориям */}
      <div className="vice-card p-6 relative overflow-hidden bg-gradient-to-br from-gray-900 to-purple-900/50 border-2 border-purple-500/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text vice-gradient font-mono tracking-wide">
            СТАТИСТИКА ПО ТИПАМ СДЕЛОК
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topCategories.map((category) => (
              <div key={category.name} className="vice-card p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white text-lg font-mono">{category.name}</h4>
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${category.color} shadow-lg`}></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white font-mono filter drop-shadow-lg">{category.count}</div>
                    <div className="text-cyan-300 font-mono text-sm">Сделок</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 font-mono filter drop-shadow-lg">{category.points}</div>
                    <div className="text-cyan-300 font-mono text-sm">Баллов</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Интересные факты */}
      <div className="vice-card p-6 relative overflow-hidden bg-gradient-to-br from-gray-900 to-purple-900/50 border-2 border-purple-500/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text vice-gradient font-mono tracking-wide">
            ИНТЕРЕСНЫЕ ФАКТЫ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="vice-card p-4 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-blue-500/50">
              <div className="font-semibold text-cyan-300 font-mono text-lg mb-1">Лидер недели</div>
              <div className="text-white font-mono">{stats.topPerformer}</div>
            </div>
            <div className="vice-card p-4 bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-500/50">
              <div className="font-semibold text-green-300 font-mono text-lg mb-1">Самый активный день</div>
              <div className="text-white font-mono">{stats.mostActiveDay}</div>
            </div>
            <div className="vice-card p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/50">
              <div className="font-semibold text-purple-300 font-mono text-lg mb-1">Рост за неделю</div>
              <div className="text-white font-mono">+{stats.weeklyGrowth}%</div>
            </div>
            <div className="vice-card p-4 bg-gradient-to-br from-orange-900/50 to-red-900/50 border border-orange-500/50">
              <div className="font-semibold text-orange-300 font-mono text-lg mb-1">Средняя сделка</div>
              <div className="text-white font-mono">125 баллов</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
