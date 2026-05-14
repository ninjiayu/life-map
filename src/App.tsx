import { useEffect, useState } from 'react';
import MapView from './components/MapView';
import Timeline from './components/Timeline';
import Settings from './components/Settings';
import CityEntryPanel from './components/CitySelector';
import MemoryCard from './components/MemoryCard';
import PosterGenerator from './components/PosterGenerator';
import { useAppStore } from './store';
import { VISIT_TYPE_META } from './types';

type Route = 'map' | 'timeline' | 'poster' | 'settings';

function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const setEntryPanelOpen = useAppStore((s) => s.setEntryPanelOpen);
  const data = useAppStore((s) => s.data);

  useEffect(() => {
    if (data.cities.length === 0) setVisible(true);
  }, [data.cities]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center p-6 fade-in" onClick={() => setVisible(false)}>
      <div className="bg-white rounded-[20px] p-8 w-full max-w-[300px] text-center shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 mx-auto mb-5 bg-[#F8F6F0] rounded-full flex items-center justify-center">
          <span className="text-[28px]">🗺️</span>
        </div>
        <h1 className="text-[24px] font-bold text-[#1E3A5F] mb-1">人生履迹</h1>
        <p className="text-[14px] text-[#6B7280] mb-6">记录你走过的路</p>
        <p className="text-[13px] text-[#9CA3AF] leading-relaxed mb-8">
          不只是去过的城市，<br/>更是带着时间、标签和记忆的人生地图
        </p>
        <button
          onClick={() => { setVisible(false); setEntryPanelOpen(true); }}
          className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-[12px] text-[15px] font-medium shadow-md shadow-[#1E3A5F]/20 active:scale-[0.98] transition-transform"
        >
          开始记录
        </button>
        <button
          onClick={() => setVisible(false)}
          className="w-full py-3 mt-3 text-[14px] text-[#9CA3AF] active:text-[#6B7280] transition-colors"
        >
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

  const navTabs: { key: Route; icon: string; label: string }[] = [
    { key: 'map', icon: '🗺️', label: '地图' },
    { key: 'timeline', icon: '📊', label: '时间轴' },
    { key: 'poster', icon: '📸', label: '海报' },
    { key: 'settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAF9] overflow-hidden">
      {/* Header */}
      <header className="px-4 pt-3 pb-2.5 bg-white/90 backdrop-blur-md border-b border-[#E8E6E1]/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-[#1E3A5F] tracking-tight leading-tight">人生履迹</h1>
            {totalCities > 0 && (
              <span className="text-[11px] text-[#9CA3AF]">{provinces} 省 · {totalCities} 城</span>
            )}
          </div>
          <button
            onClick={() => setEntryPanelOpen(true)}
            className="w-9 h-9 flex items-center justify-center bg-[#1E3A5F] text-white rounded-full text-[20px] font-light shadow-md shadow-[#1E3A5F]/15 active:scale-[0.92] transition-transform"
            aria-label="添加城市"
          >
            +
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {route === 'map' && (
          <>
            <MapView />
            {/* Legend pills below map */}
            {totalCities > 0 && (
              <div className="px-3 py-1.5 flex flex-wrap gap-1.5 justify-center bg-white/80 border-t border-[#E8E6E1]/30">
                {Object.entries(VISIT_TYPE_META).map(([type, meta]) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: meta.color + '12',
                      color: meta.color,
                    }}
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </span>
                ))}
              </div>
            )}
          </>
        )}
        {route === 'timeline' && <Timeline />}
        {route === 'poster' && <PosterGenerator inlineMode />}
        {route === 'settings' && <Settings />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-[#E5E7EB] px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {navTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setRoute(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                route === tab.key
                  ? 'text-[#1E3A5F]'
                  : 'text-[#9CA3AF]'
              }`}
            >
              <span className="text-[20px] leading-none">{tab.icon}</span>
              <span className={`text-[11px] ${route === tab.key ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modals */}
      <CityEntryPanel />
      <MemoryCard />
      <WelcomeModal />
    </div>
  );
}
