import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { PROVINCES, getCitiesByProvince, searchCities } from '../data/cities';
import type { VisitType } from '../types';
import { VISIT_TYPE_META } from '../types';

const VISIT_TYPES: VisitType[] = ['residence', 'education', 'work', 'travel', 'transit'];

export default function CityEntryPanel() {
  const open = useAppStore((s) => s.showEntryPanel);
  const setOpen = useAppStore((s) => s.setEntryPanelOpen);
  const addCityVisit = useAppStore((s) => s.addCityVisit);
  const getCityRecord = useAppStore((s) => s.getCityRecord);

  const [step, setStep] = useState<'province' | 'city' | 'detail'>('province');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState<{ code: string; name: string; province: string; center: [number, number] } | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [visitType, setVisitType] = useState<VisitType>('travel');
  const [memory, setMemory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const provinceCities = useMemo(() => {
    if (!selectedProvince) return [];
    return getCitiesByProvince(selectedProvince);
  }, [selectedProvince]);

  const searchResults = useMemo(() => {
    return searchCities(searchQuery);
  }, [searchQuery]);

  const currentYear = new Date().getFullYear();
  // Year picker: 1950 - current, show as scrollable list
  const yearOptions = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

  function handleProvinceSelect(province: string) {
    setSelectedProvince(province);
    setStep('city');
  }

  function handleCityClick(code: string, name: string, province: string, center: [number, number]) {
    setSelectedCity({ code, name, province, center });
    setStep('detail');
  }

  function handleSubmit() {
    if (!selectedCity) return;
    const id = crypto.randomUUID();
    addCityVisit(selectedCity.code, selectedCity.name, selectedCity.province, selectedCity.center, {
      id,
      year,
      type: visitType,
      memory: memory.trim(),
    });
    setOpen(false);
    resetForm();
  }

  function resetForm() {
    setStep('province');
    setSelectedProvince('');
    setSelectedCity(null);
    setYear(currentYear);
    setVisitType('travel');
    setMemory('');
    setSearchQuery('');
  }

  // Province quick index
  const provinceGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    PROVINCES.forEach((p) => {
      const initial = p.charAt(0);
      if (!groups[initial]) groups[initial] = [];
      groups[initial].push(p);
    });
    return groups;
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={() => { setOpen(false); resetForm(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Panel */}
      <div
        className="relative bg-white w-full rounded-t-[20px] max-h-[88vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#D1D5DB]" />
        </div>

        {/* Header */}
        <div className="flex items-center px-5 py-2.5 border-b border-[#F0F0F0]">
          {step !== 'province' && (
            <button
              onClick={() => setStep(step === 'detail' ? 'city' : 'province')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] active:bg-[#EEEEEE] transition-colors"
            >
              <svg className="w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h3 className="flex-1 text-center text-[17px] font-bold text-[#1E3A5F]">
            {step === 'province' ? '选择省份' : step === 'city' ? selectedProvince : selectedCity?.name}
          </h3>
          <button
            onClick={() => { setOpen(false); resetForm(); }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] active:bg-[#EEEEEE] transition-colors"
          >
            <svg className="w-5 h-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        {step !== 'detail' && (
          <div className="px-5 py-3">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索城市或省份..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F5] rounded-[12px] text-[14px] text-[#374151] placeholder-[#B0B0B0] outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A5F]/15 border border-transparent focus:border-[#1E3A5F]/15 transition-all"
              />
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Search results */}
          {searchQuery && step !== 'detail' && (
            <div className="px-5 pb-4">
              {searchResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[28px] mb-2">🔍</p>
                  <p className="text-[14px] text-[#9CA3AF]">未找到匹配城市</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.slice(0, 30).map((city) => {
                    const isVisited = getCityRecord(city.code);
                    return (
                      <button
                        key={city.code}
                        onClick={() => handleCityClick(city.code, city.name, city.province, city.center)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-[12px] text-[14px] transition-all ${
                          isVisited
                            ? 'bg-[#F0FDF4] text-[#166534]'
                            : 'bg-white text-[#374151] hover:bg-[#F9FAFB] active:bg-[#F3F4F6]'
                        }`}
                      >
                        <div className="text-left">
                          <span className="font-medium">{city.name}</span>
                          <span className="text-[12px] text-[#9CA3AF] ml-2">{city.province}</span>
                        </div>
                        {isVisited && (
                          <span className="text-[11px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full font-medium">
                            已记录
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Province list */}
          {!searchQuery && step === 'province' && (
            <div className="px-5 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {PROVINCES.map((p) => {
                  const cityCount = getCitiesByProvince(p).length;
                  return (
                    <button
                      key={p}
                      onClick={() => handleProvinceSelect(p)}
                      className="flex flex-col items-center justify-center px-3 py-3.5 bg-white rounded-[12px] border border-[#F0F0F0] hover:border-[#1E3A5F]/20 active:bg-[#F8F9FF] transition-all"
                    >
                      <span className="text-[14px] font-medium text-[#374151]">{p}</span>
                      <span className="text-[11px] text-[#B0B0B0] mt-0.5">{cityCount} 个城市</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* City list */}
          {!searchQuery && step === 'city' && (
            <div className="px-5 pb-4">
              <div className="space-y-1">
                {provinceCities.map((city) => {
                  const isVisited = getCityRecord(city.code);
                  return (
                    <button
                      key={city.code}
                      onClick={() => handleCityClick(city.code, city.name, city.province, city.center)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-[12px] text-[14px] transition-all ${
                        isVisited
                          ? 'bg-[#F0FDF4] text-[#166534]'
                          : 'bg-white hover:bg-[#F9FAFB] active:bg-[#F3F4F6]'
                      }`}
                    >
                      <span className="font-medium">{city.name}</span>
                      {isVisited && (
                        <span className="text-[11px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full font-medium">
                          已记录
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detail form */}
          {step === 'detail' && selectedCity && (
            <div className="px-5 pb-8 pt-1">
              {/* City info */}
              <div className="mb-5 p-4 bg-[#F8F9FF] rounded-[14px]">
                <p className="text-[16px] font-bold text-[#1E3A5F]">{selectedCity.name}</p>
                <p className="text-[13px] text-[#6B7280] mt-0.5">{selectedCity.province}</p>
              </div>

              {/* Year picker */}
              <div className="mb-5">
                <label className="text-[13px] font-semibold text-[#6B7280] mb-2.5 block">到访年份</label>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border border-[#E8E8E8] rounded-[12px] text-[15px] text-[#374151] outline-none focus:border-[#1E3A5F]/30 focus:ring-2 focus:ring-[#1E3A5F]/10 appearance-none transition-all"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y} 年
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Visit type */}
              <div className="mb-5">
                <label className="text-[13px] font-semibold text-[#6B7280] mb-2.5 block">到访类型</label>
                <div className="grid grid-cols-5 gap-2">
                  {VISIT_TYPES.map((type) => {
                    const meta = VISIT_TYPE_META[type];
                    const isActive = visitType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setVisitType(type)}
                        className={`flex flex-col items-center justify-center py-3 rounded-[12px] text-[11px] border-2 transition-all ${
                          isActive
                            ? 'border-[#1E3A5F] bg-[#F8F9FF] shadow-sm scale-[1.02]'
                            : 'border-[#F0F0F0] bg-white hover:border-[#E0E0E0]'
                        }`}
                      >
                        <span className="text-[18px] mb-1">{meta.emoji}</span>
                        <span className={isActive ? 'text-[#1E3A5F] font-semibold' : 'text-[#6B7280]'}>
                          {meta.label.replace('工作/出差', '工作')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Memory text */}
              <div className="mb-6">
                <label className="text-[13px] font-semibold text-[#6B7280] mb-2.5 block">一句话记忆 <span className="text-[#B0B0B0] font-normal">（可选）</span></label>
                <textarea
                  value={memory}
                  onChange={(e) => setMemory(e.target.value.slice(0, 100))}
                  placeholder="比如：第一次来阿里面试"
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#374151] placeholder-[#B0B0B0] outline-none focus:border-[#1E3A5F]/30 focus:ring-2 focus:ring-[#1E3A5F]/10 resize-none transition-all"
                />
                <p className="text-[11px] text-[#B0B0B0] text-right mt-1">{memory.length}/100</p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-[#1E3A5F] text-white rounded-[14px] text-[15px] font-semibold shadow-lg shadow-[#1E3A5F]/25 hover:shadow-xl active:scale-[0.98] transition-all"
              >
                保存记录
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
