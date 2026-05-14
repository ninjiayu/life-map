import { useMemo } from 'react';
import { useAppStore } from '../store';
import { VISIT_TYPE_META } from '../types';

export default function Timeline() {
  const data = useAppStore((s) => s.data);
  const selectCity = useAppStore((s) => s.selectCity);
  const setMemoryCardOpen = useAppStore((s) => s.setMemoryCardOpen);
  const setEntryPanelOpen = useAppStore((s) => s.setEntryPanelOpen);

  const timelineData = useMemo(() => {
    const yearMap: Record<number, Array<{ code: string; name: string; type: string; memory: string }>> = {};
    data.cities.forEach((city) => {
      city.visits.forEach((visit) => {
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
        <button
          onClick={() => setEntryPanelOpen(true)}
          className="mt-4 px-5 py-2.5 bg-[#1E3A5F] text-white text-[14px] rounded-[10px] font-medium shadow-md shadow-[#1E3A5F]/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          添加第一个城市
        </button>
      </div>
    );
  }

  // Summary stats
  const totalYears = timelineData.length;
  const totalVisits = timelineData.reduce((sum, y) => sum + y.visits.length, 0);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[18px] font-bold text-[#1E3A5F]">时间轴</h2>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">
          跨越 {totalYears} 年，{totalVisits} 条记录
        </p>
      </div>

      <div className="relative ml-3">
        {timelineData.map(({ year, visits }) => (
          <div key={year} className="mb-5 relative pl-7 last:mb-2">
            {/* Timeline dot */}
            <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full bg-[#1E3A5F] border-2 border-[#FAFAF9] shadow-sm z-10" />

            {/* Year label */}
            <h3 className="text-[17px] font-bold text-[#1E3A5F] mb-2">
              {year}
              <span className="ml-2 text-[11px] font-normal text-[#9CA3AF]">
                {visits.length} 条
              </span>
            </h3>

            {/* Visit cards */}
            <div className="space-y-2">
              {visits.map((v, i) => (
                <button
                  key={i}
                  onClick={() => {
                    selectCity(v.code);
                    setMemoryCardOpen(true);
                  }}
                  className="w-full bg-white border border-[#E5E7EB] rounded-[12px] p-3.5 text-left hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Type icon */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] flex-shrink-0"
                      style={{
                        backgroundColor:
                          (VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.color || '#9CA3AF') + '15',
                      }}
                    >
                      {VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[14px] font-semibold text-[#374151]">{v.name}</p>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor:
                              (VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.color || '#9CA3AF') + '15',
                            color: VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.color || '#9CA3AF',
                          }}
                        >
                          {VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.label}
                        </span>
                      </div>
                      {v.memory && (
                        <p className="text-[12px] text-[#6B7280] italic leading-relaxed truncate">
                          "{v.memory}"
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom padding for scroll */}
      <div className="h-6" />
    </div>
  );
}
