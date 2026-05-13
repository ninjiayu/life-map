import { useRef, useState } from 'react';
import { useAppStore } from '../store';
import { downloadJSON, importJSON } from '../utils/storage';

export default function Settings() {
  const data = useAppStore((s) => s.data);
  const clearAllData = useAppStore((s) => s.clearAllData);
  const replaceData = useAppStore((s) => s.replaceData);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState('');

  function handleExport() {
    downloadJSON(data);
    setMsg('已导出');
    setTimeout(() => setMsg(''), 2000);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importJSON(file);
      replaceData(imported);
      setMsg('导入成功');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : '导入失败');
    }
    setTimeout(() => setMsg(''), 3000);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleClear() {
    clearAllData();
    setShowConfirm(false);
    setMsg('数据已清空');
    setTimeout(() => setMsg(''), 2000);
  }

  const totalCities = data.cities.length;
  const totalVisits = data.cities.reduce((sum, c) => sum + c.visits.length, 0);
  const provinces = new Set(data.cities.map(c => c.province)).size;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <h2 className="text-[18px] font-bold text-[#1E3A5F] mb-4">设置</h2>

      {/* Stats card */}
      <div className="bg-white rounded-[12px] p-5 shadow-sm border border-[#E5E7EB] mb-4">
        <h3 className="text-[13px] font-medium text-[#9CA3AF] uppercase tracking-wide mb-4">数据统计</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[28px] font-bold text-[#1E3A5F]">{provinces}</p>
            <p className="text-[12px] text-[#9CA3AF]">省份</p>
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#1E3A5F]">{totalCities}</p>
            <p className="text-[12px] text-[#9CA3AF]">城市</p>
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#1E3A5F]">{totalVisits}</p>
            <p className="text-[12px] text-[#9CA3AF]">记录</p>
          </div>
        </div>
      </div>

      {/* Action list */}
      <div className="bg-white rounded-[12px] shadow-sm border border-[#E5E7EB] overflow-hidden">
        <button
          onClick={handleExport}
          className="w-full px-5 py-4 text-left text-[14px] text-[#374151] border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors flex items-center gap-3"
        >
          <span className="text-[18px]">📤</span>
          <span>导出数据</span>
        </button>
        <label className="w-full px-5 py-4 text-left text-[14px] text-[#374151] border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors flex items-center gap-3 cursor-pointer">
          <span className="text-[18px]">📥</span>
          <span>导入数据</span>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full px-5 py-4 text-left text-[14px] text-[#EF4444] hover:bg-[#FEF2F2] transition-colors flex items-center gap-3"
        >
          <span className="text-[18px]">🗑️</span>
          <span>清空所有数据</span>
        </button>
      </div>

      {/* Version */}
      <p className="text-[12px] text-[#9CA3AF] text-center mt-6">人生履迹地图 v1.0</p>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-[16px] p-6 w-full max-w-[300px] shadow-xl" onClick={e => e.stopPropagation()}>
            <h4 className="text-[17px] font-bold text-[#1E3A5F] mb-2">确认清空？</h4>
            <p className="text-[14px] text-[#6B7280] mb-5 leading-relaxed">此操作不可撤销，所有足迹数据将被永久删除。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-[10px] bg-[#F3F4F6] text-[14px] text-[#374151] font-medium hover:bg-[#E5E7EB] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-3 rounded-[10px] bg-[#EF4444] text-[14px] text-white font-medium hover:bg-[#DC2626] transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {msg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1F2937] text-white text-[13px] px-5 py-2.5 rounded-full shadow-lg z-50">
          {msg}
        </div>
      )}
    </div>
  );
}
