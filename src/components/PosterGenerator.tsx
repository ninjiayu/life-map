import { useRef, useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { domToPng } from 'modern-screenshot';
import { VISIT_TYPE_META } from '../types';

export default function PosterGenerator() {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const data = useAppStore((s) => s.data);
  const posterRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const provinces = new Set(data.cities.map(c => c.province)).size;
    const cities = data.cities.length;
    const visits = data.cities.reduce((sum, c) => sum + c.visits.length, 0);
    const years = data.cities.flatMap(c => c.visits.map(v => v.year));
    const minYear = years.length ? Math.min(...years) : null;
    const maxYear = years.length ? Math.max(...years) : null;
    return { provinces, cities, visits, minYear, maxYear };
  }, [data]);

  const goldenSentence = useMemo(() => {
    if (stats.visits === 0) return '记录你走过的每一段路';
    const parts: string[] = [];
    if (stats.minYear && stats.maxYear) {
      parts.push(`${stats.minYear}-${stats.maxYear}`);
    }
    if (stats.provinces > 0) {
      parts.push(`你在 ${stats.provinces} 个省份留下了足迹`);
    }
    if (stats.cities > 0) {
      parts.push(`走过了 ${stats.cities} 座城市`);
    }
    return parts.join('，');
  }, [stats]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      if (posterRef.current) {
        const dataUrl = await domToPng(posterRef.current, {
          quality: 1,
          scale: 2,
        });
        setPosterUrl(dataUrl);
      }
    } catch (e) {
      console.error('Poster generation failed:', e);
    }
    setGenerating(false);
  }

  function handleSave() {
    if (!posterUrl) return;
    const a = document.createElement('a');
    a.href = posterUrl;
    a.download = `life-map-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-btn text-sm font-medium active:opacity-90"
      >
        📸 生成海报
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => { setOpen(false); setPosterUrl(null); }}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold text-navy">生成分享海报</h3>
          <button onClick={() => { setOpen(false); setPosterUrl(null); }} className="text-sm text-gray-400">关闭</button>
        </div>

        {/* Poster preview (hidden, used for rendering) */}
        <div className="sr-only">
          <div ref={posterRef} className="w-[375px] p-6" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)' }}>
            <div className="text-center mb-8">
              <p className="text-white/60 text-xs mb-2">人生履迹地图</p>
              <h2 className="text-white text-2xl font-bold">{goldenSentence}</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white text-xl font-bold">{stats.provinces}</p>
                <p className="text-white/60 text-xs">省份</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white text-xl font-bold">{stats.cities}</p>
                <p className="text-white/60 text-xs">城市</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white text-xl font-bold">{stats.visits}</p>
                <p className="text-white/60 text-xs">足迹</p>
              </div>
            </div>
            {/* Type legend */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {data.cities.flatMap(c => c.visits.map(v => v.type)).filter((v, i, a) => a.indexOf(v) === i).map(type => (
                <span key={type} className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                  {VISIT_TYPE_META[type]?.emoji} {VISIT_TYPE_META[type]?.label}
                </span>
              ))}
            </div>
            <p className="text-white/30 text-center text-xs">生成于 {new Date().toLocaleDateString('zh-CN')}</p>
          </div>
        </div>

        {/* Result area */}
        <div className="flex-1 overflow-y-auto p-4">
          {posterUrl ? (
            <div className="space-y-3">
              <img src={posterUrl} alt="海报" className="w-full rounded-2xl shadow-lg" />
              <button onClick={handleSave} className="w-full py-3 bg-navy text-white rounded-xl text-sm font-medium">
                💾 保存海报
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 bg-navy text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {generating ? '生成中...' : '✨ 点击生成'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
