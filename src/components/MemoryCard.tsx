import { useAppStore } from '../store';
import { VISIT_TYPE_META } from '../types';
import { getCityByCode } from '../data/cities';

export default function MemoryCard() {
  const open = useAppStore((s) => s.showMemoryCard);
  const setOpen = useAppStore((s) => s.setMemoryCardOpen);
  const selectedCode = useAppStore((s) => s.selectedCityCode);
  const data = useAppStore((s) => s.data);
  const removeVisit = useAppStore((s) => s.removeVisit);
  const setEntryPanelOpen = useAppStore((s) => s.setEntryPanelOpen);

  const cityRecord = data.cities.find(c => c.code === selectedCode);
  const cityInfo = selectedCode ? getCityByCode(selectedCode) : null;
  const displayName = cityRecord?.name || cityInfo?.name || '';
  const displayProvince = cityRecord?.province || cityInfo?.province || '';

  if (!open || !selectedCode) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setOpen(false)}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[70vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
          <h3 className="text-lg font-bold text-navy">{displayName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{displayProvince}</p>
        </div>

        <div className="overflow-y-auto max-h-[55vh] px-4 pb-6">
          {cityRecord?.visits.map((visit) => (
            <div key={visit.id} className="bg-gray-50 rounded-xl p-3 mb-2 relative group">
              <div className="flex items-center gap-2">
                <span className="text-lg">{VISIT_TYPE_META[visit.type]?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{visit.year} 年</p>
                  <p className="text-xs text-gray-500">{VISIT_TYPE_META[visit.type]?.label}</p>
                  {visit.memory && (
                    <p className="text-xs text-gray-400 mt-1 italic">"{visit.memory}"</p>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeVisit(selectedCode, visit.id);
                }}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={() => { setOpen(false); setEntryPanelOpen(true); }}
            className="w-full py-3 mt-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 active:border-blue-300 active:text-blue-500"
          >
            + 添加更多记录
          </button>
        </div>
      </div>
    </div>
  );
}
