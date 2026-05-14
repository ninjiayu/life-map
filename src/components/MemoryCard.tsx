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

  const cityRecord = data.cities.find((c) => c.code === selectedCode);
  const cityInfo = selectedCode ? getCityByCode(selectedCode) : null;
  const displayName = cityRecord?.name || cityInfo?.name || '';
  const displayProvince = cityRecord?.province || cityInfo?.province || '';

  if (!open || !selectedCode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Card */}
      <div
        className="relative bg-white w-full rounded-t-[20px] max-h-[75vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#D1D5DB]" />
        </div>

        {/* City header */}
        <div className="px-5 pt-2 pb-4 border-b border-[#F0F0F0]">
          <h3 className="text-[20px] font-bold text-[#1E3A5F]">{displayName}</h3>
          <p className="text-[13px] text-[#9CA3AF] mt-0.5">{displayProvince}</p>
        </div>

        {/* Visits list */}
        <div className="overflow-y-auto max-h-[50vh] px-5 py-4 space-y-3">
          {cityRecord?.visits.map((visit) => (
            <div
              key={visit.id}
              className="bg-[#F8F9FA] rounded-[14px] p-4 relative"
            >
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[18px]"
                  style={{
                    backgroundColor: (VISIT_TYPE_META[visit.type]?.color || '#9CA3AF') + '15',
                  }}
                >
                  {VISIT_TYPE_META[visit.type]?.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-[#374151]">{visit.year} 年</span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: (VISIT_TYPE_META[visit.type]?.color || '#9CA3AF') + '15',
                        color: VISIT_TYPE_META[visit.type]?.color || '#9CA3AF',
                      }}
                    >
                      {VISIT_TYPE_META[visit.type]?.label}
                    </span>
                  </div>
                  {visit.memory && (
                    <p className="text-[13px] text-[#6B7280] italic leading-relaxed">
                      "{visit.memory}"
                    </p>
                  )}
                </div>
              </div>

              {/* Delete button - always visible on mobile */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeVisit(selectedCode, visit.id);
                }}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-[#EF4444] bg-[#FEF2F2] text-[12px] active:bg-[#FEE2E2] transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add more */}
          <button
            onClick={() => {
              setOpen(false);
              setEntryPanelOpen(true);
            }}
            className="w-full py-4 border-2 border-dashed border-[#E0E0E0] rounded-[14px] text-[14px] text-[#9CA3AF] hover:border-[#1E3A5F]/30 hover:text-[#1E3A5F] active:bg-[#F8F9FA] transition-all"
          >
            + 添加更多记录
          </button>
        </div>
      </div>
    </div>
  );
}
