import { useMemo } from 'react';
import { useAppStore } from '../store';
import { VISIT_TYPE_META } from '../types';

export default function Timeline() {
  const data = useAppStore((s) => s.data);
  const selectCity = useAppStore((s) => s.selectCity);
  const setMemoryCardOpen = useAppStore((s) => s.setMemoryCardOpen);

  const timelineData = useMemo(() => {
    const yearMap: Record<number, Array<{ code: string; name: string; type: string; memory: string }>> = {};
    data.cities.forEach(city => {
      city.visits.forEach(visit => {
        if (!yearMap[visit.year]) yearMap[visit.year] = [];
        yearMap[visit.year].push({
          code: city.code,
          name: city.name,
          type: visit.type,
          memory: visit.memory,
        });
      });
    });
    return Object.entries(yearMap)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, visits]) => ({ year: Number(year), visits }));
  }, [data.cities]);

  if (timelineData.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
          <span className="text-[28px]">📊</span>
        </div>
        <p className="text-[16px] font-medium text-[#374151] mb-1">还没有足迹记录</p>
        <p className="text-[13px] text-[#9CA3AF] text-center">添加你的第一个城市，这里会展示你的人生轨迹时间线</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <h2 className="text-[18px] font-bold text-[#1E3A5F] mb-4">时间轴</h2>

      <div className="relative ml-3">
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-[#E5E7EB]" />

        {timelineData.map(({ year, visits }) => (
          <div key={year} className="mb-6 relative pl-7">
            {/* Year dot */}
            <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-[#1E3A5F] border-2 border-white shadow-sm" />

            {/* Year label */}
            <h3 className="text-[18px] font-bold text-[#1E3A5F] mb-2">{year}</h3>

            {/* Visit cards */}
            <div className="space-y-2">
              {visits.map((v, i) => (
                <button
                  key={i}
                  onClick={() => { selectCity(v.code); setMemoryCardOpen(true); }}
                  className="w-full bg-white border border-[#E5E7EB] rounded-[12px] p-3.5 text-left hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] flex-shrink-0"
                      style={{ backgroundColor: (VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.color || '#9CA3AF') + '15' }}
                    >
                      {VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#374151]">{v.name}</p>
                      <p className="text-[12px] text-[#9CA3AF] truncate">
                        {VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.label}
                        {v.memory && <span className="ml-1">· "{v.memory}"</span>}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
