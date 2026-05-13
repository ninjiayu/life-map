import { useRef, useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { domToPng } from 'modern-screenshot';
import { VISIT_TYPE_META } from '../types';

interface Props {
  inlineMode?: boolean;
}

export default function PosterGenerator(_props: Props) {
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

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Page title */}
      <h2 className="text-[18px] font-bold text-[#1E3A5F] mb-4">生成分享海报</h2>

      {/* Poster template (used for rendering, positioned off-screen) */}
      <div className="fixed -left-[9999px] top-0">
        <div ref={posterRef} style={{ width: '375px', padding: '32px 24px', background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>人生履迹地图</p>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', lineHeight: '1.4' }}>{goldenSentence}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{stats.provinces}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>省份</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{stats.cities}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>城市</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{stats.visits}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>足迹</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
            {data.cities.flatMap(c => c.visits.map(v => v.type)).filter((v, i, a) => a.indexOf(v) === i).map(type => (
              <span key={type} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', padding: '4px 10px', borderRadius: '99px' }}>
                {VISIT_TYPE_META[type]?.emoji} {VISIT_TYPE_META[type]?.label}
              </span>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: '11px' }}>生成于 {new Date().toLocaleDateString('zh-CN')}</p>
        </div>
      </div>

      {/* Preview card */}
      <div className="bg-white rounded-[12px] shadow-sm border border-[#E5E7EB] overflow-hidden mb-4">
        {posterUrl ? (
          <img src={posterUrl} alt="海报预览" className="w-full" />
        ) : (
          /* Preview placeholder */
          <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)' }}>
            <p className="text-white/60 text-[12px] mb-2">人生履迹地图</p>
            <p className="text-white text-[18px] font-bold mb-6">{goldenSentence}</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/10 rounded-[10px] py-3">
                <p className="text-white text-[22px] font-bold">{stats.provinces}</p>
                <p className="text-white/60 text-[11px]">省份</p>
              </div>
              <div className="bg-white/10 rounded-[10px] py-3">
                <p className="text-white text-[22px] font-bold">{stats.cities}</p>
                <p className="text-white/60 text-[11px]">城市</p>
              </div>
              <div className="bg-white/10 rounded-[10px] py-3">
                <p className="text-white text-[22px] font-bold">{stats.visits}</p>
                <p className="text-white/60 text-[11px]">足迹</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {posterUrl ? (
        <div className="space-y-3">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-[12px] text-[15px] font-medium shadow-lg shadow-[#1E3A5F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            💾 保存到相册
          </button>
          <button
            onClick={() => setPosterUrl(null)}
            className="w-full py-3.5 bg-white text-[#6B7280] border border-[#E5E7EB] rounded-[12px] text-[14px] hover:bg-[#F9FAFB] transition-colors"
          >
            重新生成
          </button>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white rounded-[12px] text-[15px] font-medium shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
        >
          {generating ? '✨ 生成中...' : '✨ 生成海报'}
        </button>
      )}
    </div>
  );
}
