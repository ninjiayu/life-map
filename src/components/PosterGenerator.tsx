import { useRef, useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store';
import { domToPng } from 'modern-screenshot';
import { VISIT_TYPE_META } from '../types';

interface Props {
  inlineMode?: boolean;
}

export default function PosterGenerator(_props: Props) {
  const [generating, setGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const data = useAppStore((s) => s.data);

  const stats = useMemo(() => {
    const provinces = new Set(data.cities.map((c) => c.province)).size;
    const cities = data.cities.length;
    const visits = data.cities.reduce((sum, c) => sum + c.visits.length, 0);
    const years = data.cities.flatMap((c) => c.visits.map((v) => v.year));
    const minYear = years.length ? Math.min(...years) : null;
    const maxYear = years.length ? Math.max(...years) : null;
    const typeStats: Record<string, number> = {};
    data.cities.forEach((c) =>
      c.visits.forEach((v) => {
        typeStats[v.type] = (typeStats[v.type] || 0) + 1;
      })
    );
    return { provinces, cities, visits, minYear, maxYear, typeStats };
  }, [data]);

  const goldenSentence = useMemo(() => {
    if (stats.visits === 0) return '记录你走过的每一段路';
    const parts: string[] = [];
    if (stats.minYear && stats.maxYear) {
      parts.push(`${stats.minYear} – ${stats.maxYear}`);
    }
    if (stats.cities > 0) {
      parts.push(`跨越 ${stats.cities} 座城市`);
    }
    if (stats.provinces > 0) {
      parts.push(`走过 ${stats.provinces} 个省份`);
    }
    return parts.join('\n');
  }, [stats]);

  const subSentence = useMemo(() => {
    if (stats.visits === 0) return '';
    // Pick most visited type
    const topType = Object.entries(stats.typeStats).sort((a, b) => b[1] - a[1])[0];
    if (topType) {
      const meta = VISIT_TYPE_META[topType[0] as keyof typeof VISIT_TYPE_META];
      return `${meta?.emoji} ${meta?.label}是最多的旅途方式`;
    }
    return '';
  }, [stats]);

  // Pick one random memory
  const randomMemory = useMemo(() => {
    const allMemories = data.cities.flatMap((c) =>
      c.visits.filter((v) => v.memory).map((v) => ({ city: c.name, memory: v.memory, year: v.year }))
    );
    if (allMemories.length === 0) return '';
    return allMemories[Math.floor(Math.random() * allMemories.length)];
  }, [data]);

  async function handleGenerate() {
    setGenerating(true);
    // Small delay for UI feedback
    await new Promise((r) => setTimeout(r, 300));
    try {
      if (posterRef.current) {
        const dataUrl = await domToPng(posterRef.current, {
          quality: 1,
          scale: 2,
          backgroundColor: '#1E3A5F',
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
    a.download = `人生履迹-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  }

  if (data.cities.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
          <span className="text-[28px]">📸</span>
        </div>
        <p className="text-[16px] font-medium text-[#374151] mb-1">还没有足迹记录</p>
        <p className="text-[13px] text-[#9CA3AF] text-center">添加你的第一个城市，生成专属人生履迹海报</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <h2 className="text-[18px] font-bold text-[#1E3A5F] mb-4">生成分享海报</h2>

      {/* Poster template (hidden, used for rendering) */}
      <div className="fixed -left-[9999px] top-0">
        <div
          ref={posterRef}
          style={{
            width: '375px',
            padding: '40px 28px',
            background: 'linear-gradient(160deg, #1E3A5F 0%, #2D5A87 40%, #1a4a6e 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            boxSizing: 'border-box',
          }}
        >
          {/* Top label */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px', marginBottom: '12px', textTransform: 'uppercase' }}>
              LIFE MAP
            </p>
            <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {goldenSentence}
            </h2>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
            {[
              { num: stats.provinces, label: '省份' },
              { num: stats.cities, label: '城市' },
              { num: stats.visits, label: '足迹' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '16px 8px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px' }}>{item.num}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Memory quote */}
          {randomMemory && (
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                borderLeft: '3px solid rgba(245,158,11,0.6)',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 6px' }}>
                "{randomMemory.memory}"
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>
                — {randomMemory.city}，{randomMemory.year}
              </p>
            </div>
          )}

          {/* Type tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}>
            {Object.entries(stats.typeStats).map(([type, count]) => {
              const meta = VISIT_TYPE_META[type as keyof typeof VISIT_TYPE_META];
              if (!meta) return null;
              return (
                <span
                  key={type}
                  style={{
                    background: meta.color + '22',
                    color: meta.color,
                    fontSize: '11px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontWeight: '500',
                  }}
                >
                  {meta.emoji} {meta.label} · {count}
                </span>
              );
            })}
          </div>

          {/* Bottom */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
            <p style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', fontSize: '10px', letterSpacing: '1px' }}>
              人生履迹 · {new Date().toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
      </div>

      {/* Preview card */}
      {posterUrl ? (
        <div className="bg-white rounded-[12px] shadow-sm border border-[#E5E7EB] overflow-hidden mb-4">
          <img src={posterUrl} alt="海报预览" className="w-full" />
        </div>
      ) : (
        <div
          className="bg-white rounded-[12px] shadow-sm border border-[#E5E7EB] overflow-hidden mb-4"
          style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)' }}
        >
          <div className="p-6">
            {/* Preview header */}
            <div className="text-center mb-5">
              <p className="text-white/40 text-[10px] tracking-widest uppercase mb-2">LIFE MAP</p>
              <p className="text-white text-[18px] font-bold leading-relaxed whitespace-pre-line">{goldenSentence}</p>
            </div>

            {/* Preview stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { num: stats.provinces, label: '省份' },
                { num: stats.cities, label: '城市' },
                { num: stats.visits, label: '足迹' },
              ].map((item, i) => (
                <div key={i} className="bg-white/8 rounded-[10px] py-3 border border-white/8">
                  <p className="text-white text-[22px] font-bold mb-0.5">{item.num}</p>
                  <p className="text-white/50 text-[11px]">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Preview memory */}
            {randomMemory && (
              <div className="bg-white/6 rounded-[8px] p-3 mb-4 border-l-[3px] border-[#F59E0B]/60">
                <p className="text-white/70 text-[12px] italic leading-relaxed mb-1">"{randomMemory.memory}"</p>
                <p className="text-white/35 text-[10px]">— {randomMemory.city}，{randomMemory.year}</p>
              </div>
            )}

            {/* Preview types */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {Object.entries(stats.typeStats).map(([type, count]) => {
                const meta = VISIT_TYPE_META[type as keyof typeof VISIT_TYPE_META];
                if (!meta) return null;
                return (
                  <span
                    key={type}
                    className="text-[11px] px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: meta.color + '22',
                      color: meta.color,
                    }}
                  >
                    {meta.emoji} {meta.label} · {count}
                  </span>
                );
              })}
            </div>

            {/* Preview bottom */}
            <div className="text-center">
              <div className="w-8 h-[1px] bg-white/15 mx-auto mb-2" />
              <p className="text-white/25 text-[10px] tracking-wider">人生履迹 · {new Date().toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {posterUrl ? (
        <div className="space-y-3">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-[12px] text-[15px] font-medium shadow-lg shadow-[#1E3A5F]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
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
          className="w-full py-3.5 bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white rounded-[12px] text-[15px] font-medium shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
        >
          {generating ? '✨ 生成中...' : '✨ 生成海报'}
        </button>
      )}
    </div>
  );
}
