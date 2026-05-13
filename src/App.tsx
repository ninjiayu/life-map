import { useEffect, useState } from 'react';
import MapView from './components/MapView';
import Timeline from './components/Timeline';
import Settings from './components/Settings';
import CityEntryPanel from './components/CitySelector';
import MemoryCard from './components/MemoryCard';
import PosterGenerator from './components/PosterGenerator';
import { useAppStore } from './store';
import type { Route } from './types';
import { VISIT_TYPE_META } from './types';

function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const setEntryPanelOpen = useAppStore((s) => s.setEntryPanelOpen);
  const data = useAppStore((s) => s.data);

  useEffect(() => {
    if (data.cities.length === 0) {
      setVisible(true);
    }
  }, [data.cities]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={() => setVisible(false)}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center" onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-3">🗺️</div>
        <h2 className="text-xl font-bold text-navy mb-2">记录你走过的路</h2>
        <p className="text-sm text-gray-500 mb-5">不是去过的城市列表，而是带着时间、标签和记忆的人生地图</p>
        <button
          onClick={() => { setVisible(false); setEntryPanelOpen(true); }}
          className="w-full py-3 bg-navy text-white rounded-xl text-sm font-medium"
        >
          开始记录
        </button>
        <button onClick={() => setVisible(false)} className="w-full py-3 mt-2 text-sm text-gray-400">
          稍后再说
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const loadData = useAppStore((s) => s.loadData);
  const setEntryPanelOpen = useAppStore((s) => s.setEntryPanelOpen);
  const [route, setRoute] = useState<Route>('map');

  useEffect(() => {
    loadData();
  }, [loadData]);

  const data = useAppStore((s) => s.data);
  const totalCities = data.cities.length;
  const provinces = new Set(data.cities.map(c => c.province)).size;

  return (
    <div className="flex flex-col h-screen bg-warm-white overflow-hidden">
      {/* Top bar */}
      <header className="px-4 pt-4 pb-2 bg-warm-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-navy">人生履迹</h1>
          {totalCities > 0 && (
            <span className="text-xs text-gray-400">
              {provinces} 省 · {totalCities} 城
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {route === 'map' && <MapView />}
        {route === 'timeline' && <Timeline />}
        {route === 'settings' && <Settings />}
      </main>

      {/* Bottom bar */}
      <footer className="px-4 pb-4 pt-2 bg-warm-white space-y-2">
        {/* Legend */}
        {totalCities > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(VISIT_TYPE_META).map(([type, meta]) => (
              <span key={type} className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                {meta.emoji} {meta.label}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setEntryPanelOpen(true)}
            className="flex-1 py-2.5 bg-navy text-white rounded-btn text-sm font-medium active:opacity-90"
          >
            + 添加城市
          </button>
          <PosterGenerator />
        </div>

        {/* Nav tabs */}
        <nav className="flex border-t border-gray-100 pt-2">
          {[
            { key: 'map' as Route, label: '🗺️ 地图' },
            { key: 'timeline' as Route, label: '📊 时间轴' },
            { key: 'settings' as Route, label: '⚙️ 设置' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setRoute(tab.key)}
              className={`flex-1 py-2 text-sm ${
                route === tab.key ? 'text-navy font-semibold border-b-2 border-navy' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </footer>

      {/* Modals */}
      <CityEntryPanel />
      <MemoryCard />
      <WelcomeModal />
    </div>
  );
}
