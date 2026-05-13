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
    if (data.cities.length === 0) {
      setVisible(true);
    }
  }, [data.cities]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setVisible(false)}>
      <div
        className="bg-white rounded-[16px] p-8 w-full max-w-[320px] text-center shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-5 bg-[#EEF2FF] rounded-full flex items-center justify-center">
          <span className="text-3xl">🗺️</span>
        </div>

        {/* Title */}
        <h1 className="text-[28px] font-bold text-[#1E3A5F] mb-2 leading-tight">人生履迹</h1>
        <h2 className="text-[16px] text-[#6B7280] mb-4">记录你走过的路</h2>

        {/* Description */}
        <p className="text-[14px] text-[#9CA3AF] leading-relaxed mb-8">
          不是去过的城市列表，而是带着时间、标签和记忆的人生地图
        </p>

        {/* Buttons */}
        <button
          onClick={() => { setVisible(false); setEntryPanelOpen(true); }}
          className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-[12px] text-[15px] font-medium shadow-lg shadow-[#1E3A5F]/20 hover:shadow-xl hover:shadow-[#1E3A5F]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          开始记录
        </button>
        <button
          onClick={() => setVisible(false)}
          className="w-full py-3.5 mt-3 text-[14px] text-[#6B7280] bg-white border border-[#E5E7EB] rounded-[12px] hover:bg-[#F9FAFB] transition-colors"
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
      <header className="px-4 pt-4 pb-2 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]/50">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-[#1E3A5F] tracking-tight">人生履迹</h1>
          <div className="flex items-center gap-3">
            {totalCities > 0 && (
              <span className="text-[12px] text-[#6B7280] bg-[#F3F4F6] px-2.5 py-1 rounded-full">
                {provinces} 省 · {totalCities} 城
              </span>
            )}
            <button
              onClick={() => setEntryPanelOpen(true)}
              className="w-8 h-8 flex items-center justify-center bg-[#1E3A5F] text-white rounded-full text-[16px] font-light shadow-md shadow-[#1E3A5F]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              +
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {route === 'map' && (
          <>
            <MapView />
            {/* Legend pills below map */}
            {totalCities > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 justify-center bg-white/60 border-t border-[#E5E7EB]/30">
                {Object.entries(VISIT_TYPE_META).map(([type, meta]) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1.5 text-[12px] text-[#374151] bg-white px-2.5 py-1 rounded-full border border-[#E5E7EB] shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
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
