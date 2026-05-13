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
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-gray-400 text-center text-sm">还没有任何足迹记录，快去添加你的第一个城市吧</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      <div className="relative border-l-2 border-gray-200 ml-4 py-4">
        {timelineData.map(({ year, visits }) => (
          <div key={year} className="mb-6 relative pl-6">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-navy border-2 border-warm-white" />
            <h3 className="text-lg font-bold text-navy mb-2">{year}</h3>
            <div className="space-y-2">
              {visits.map((v, i) => (
                <button
                  key={i}
                  onClick={() => { selectCity(v.code); setMemoryCardOpen(true); }}
                  className="w-full bg-white rounded-xl p-3 shadow-sm text-left active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{v.name}</p>
                      <p className="text-xs text-gray-400">
                        {VISIT_TYPE_META[v.type as keyof typeof VISIT_TYPE_META]?.label}
                        {v.memory && ` · "${v.memory}"`}
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
