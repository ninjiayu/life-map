import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { PROVINCES, getCitiesByProvince, searchCities } from '../data/cities';
import type { VisitType } from '../types';
import { VISIT_TYPE_META } from '../types';

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end" onClick={() => { setOpen(false); resetForm(); }}>
      <div
        className="bg-white w-full rounded-t-[16px] max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#D1D5DB]" />
        </div>

        {/* Header */}
        <div className="flex items-center px-4 py-2 border-b border-[#E5E7EB]">
          {step !== 'province' && (
            <button
              onClick={() => setStep(step === 'detail' ? 'city' : 'province')}
              className="text-[14px] text-[#6B7280] hover:text-[#374151] transition-colors"
            >
              ← 返回
            </button>
          )}
          <h3 className="text-[16px] font-bold text-[#1E3A5F] flex-1 text-center">
            {step === 'province' ? '选择省份' : step === 'city' ? selectedProvince : selectedCity?.name}
          </h3>
          <button
            onClick={() => { setOpen(false); resetForm(); }}
            className="text-[14px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            取消
          </button>
        </div>

        {/* Search bar (show in province/city step) */}
        {step !== 'detail' && (
          <div className="px-4 py-3">
            <input
              type="text"
              placeholder="🔍 搜索城市..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F3F4F6] rounded-[10px] text-[14px] text-[#374151] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:bg-white border border-transparent focus:border-[#1E3A5F]/20 transition-all"
            />
          </div>
        )}

        {/* Search results */}
        {searchQuery && step !== 'detail' && (
          <div className="overflow-y-auto flex-1 px-4 pb-4">
            {searchResults.length === 0 ? (
              <p className="text-[14px] text-[#9CA3AF] text-center py-8">未找到匹配城市</p>
            ) : (
              <div className="space-y-1.5">
                {searchResults.slice(0, 20).map(city => {
                  const isVisited = getCityRecord(city.code);
                  return (
                    <button
                      key={city.code}
                      onClick={() => handleCityClick(city.code, city.name, city.province, city.center)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-[10px] text-[14px] border transition-colors ${
                        isVisited
                          ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                          : 'bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <div className="text-left">
                        <span className="font-medium">{city.name}</span>
                        <span className="text-[12px] text-[#9CA3AF] ml-2">{city.province}</span>
                      </div>
                      {isVisited && <span className="text-[11px] text-[#10B981]">✓ 已记录</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Province selector */}
        {!searchQuery && step === 'province' && (
          <div className="overflow-y-auto flex-1 px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {PROVINCES.map(p => (
                <button
                  key={p}
                  onClick={() => handleProvinceSelect(p)}
                  className="px-3 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#374151] hover:bg-[#F9FAFB] hover:border-[#1E3A5F]/30 active:bg-[#EEF2FF] transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* City list */}
        {!searchQuery && step === 'city' && (
          <div className="overflow-y-auto flex-1 px-4 pb-4">
            <div className="space-y-1.5">
              {provinceCities.map(city => {
                const isVisited = getCityRecord(city.code);
                return (
                  <button
                    key={city.code}
                    onClick={() => handleCityClick(city.code, city.name, city.province, city.center)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-[10px] text-[14px] border transition-colors ${
                      isVisited
                        ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                        : 'bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <span className="font-medium">{city.name}</span>
                    {isVisited && <span className="text-[11px] text-[#10B981]">✓ 已记录</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Detail form */}
        {step === 'detail' && selectedCity && (
          <div className="overflow-y-auto flex-1 px-4 pb-6 pt-2">
            <div className="space-y-5">
              {/* Year selection */}
              <div>
                <label className="text-[13px] font-medium text-[#6B7280] mb-2 block">到访年份</label>
                <select
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#374151] outline-none focus:border-[#1E3A5F]/40 focus:ring-2 focus:ring-[#1E3A5F]/10 transition-all appearance-none"
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y} 年</option>
                  ))}
                </select>
              </div>

              {/* Visit type */}
              <div>
                <label className="text-[13px] font-medium text-[#6B7280] mb-2 block">到访类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(VISIT_TYPE_META) as [VisitType, typeof VISIT_TYPE_META[VisitType]][]).map(([type, meta]) => (
                    <button
                      key={type}
                      onClick={() => setVisitType(type)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[13px] border transition-all ${
                        visitType === type
                          ? 'border-[#1E3A5F] bg-[#EEF2FF] text-[#1E3A5F] font-medium shadow-sm'
                          : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory text */}
              <div>
                <label className="text-[13px] font-medium text-[#6B7280] mb-2 block">一句话记忆（可选）</label>
                <textarea
                  value={memory}
                  onChange={e => setMemory(e.target.value.slice(0, 100))}
                  placeholder="留下一句关于这座城市的记忆..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#374151] placeholder-[#9CA3AF] outline-none focus:border-[#1E3A5F]/40 focus:ring-2 focus:ring-[#1E3A5F]/10 resize-none transition-all"
                />
                <p className="text-[11px] text-[#9CA3AF] text-right mt-1">{memory.length}/100</p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-[12px] text-[15px] font-medium shadow-lg shadow-[#1E3A5F]/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                保存记录
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
