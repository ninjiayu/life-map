import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { PROVINCES, getCitiesByProvince } from '../data/cities';
import type { VisitType } from '../types';

export default function CityEntryPanel() {
  const open = useAppStore((s) => s.showEntryPanel);
  const setOpen = useAppStore((s) => s.setEntryPanelOpen);
  const addCityVisit = useAppStore((s) => s.addCityVisit);
  const getCityRecord = useAppStore((s) => s.getCityRecord);

  const [step, setStep] = useState<'province' | 'city'>('province');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [visitType, setVisitType] = useState<VisitType>('travel');
  const [memory, setMemory] = useState('');

  const provinceCities = useMemo(() => {
    if (!selectedProvince) return [];
    return getCitiesByProvince(selectedProvince);
  }, [selectedProvince]);

  const currentYear = new Date().getFullYear();

  function handleProvinceSelect(province: string) {
    setSelectedProvince(province);
    setStep('city');
  }

  function handleCitySelect(code: string, name: string, province: string, center: [number, number]) {
    const id = crypto.randomUUID();
    addCityVisit(code, name, province, center, {
      id,
      year: currentYear,
      type: visitType,
      memory: memory.trim(),
    });
    setOpen(false);
    resetForm();
  }

  function resetForm() {
    setStep('province');
    setSelectedProvince('');
    setVisitType('travel');
    setMemory('');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => { setOpen(false); resetForm(); }}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          {step === 'city' && (
            <button onClick={() => setStep('province')} className="text-sm text-gray-500">
              ← 返回
            </button>
          )}
          <h3 className="text-base font-semibold text-navy flex-1 text-center">
            {step === 'province' ? '选择省份' : selectedProvince}
          </h3>
          <button onClick={() => { setOpen(false); resetForm(); }} className="text-sm text-gray-400 px-2">
            取消
          </button>
        </div>

        {/* Province selector */}
        {step === 'province' && (
          <div className="overflow-y-auto flex-1 p-4">
            <div className="grid grid-cols-2 gap-2">
              {PROVINCES.map(p => (
                <button
                  key={p}
                  onClick={() => handleProvinceSelect(p)}
                  className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 active:bg-blue-50 active:text-navy"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* City selector + detail form */}
        {step === 'city' && (
          <div className="overflow-y-auto flex-1">
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-3">选择城市</p>
              <div className="space-y-2">
                {provinceCities.map(city => {
                  const isVisited = getCityRecord(city.code);
                  return (
                    <button
                      key={city.code}
                      onClick={() => handleCitySelect(city.code, city.name, city.province, city.center)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
                        isVisited ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                      } active:bg-blue-50`}
                    >
                      <span>{city.name}</span>
                      {isVisited && <span className="text-xs">✓ 已记录</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
