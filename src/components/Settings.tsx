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
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      {/* Stats */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">数据统计</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-navy">{provinces}</p>
            <p className="text-xs text-gray-400">省份</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{totalCities}</p>
            <p className="text-xs text-gray-400">城市</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-navy">{totalVisits}</p>
            <p className="text-xs text-gray-400">记录</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <button onClick={handleExport} className="w-full px-4 py-3.5 text-left text-sm text-gray-700 border-b border-gray-50 active:bg-gray-50">
          📤 导出数据
        </button>
        <label className="w-full px-4 py-3.5 text-left text-sm text-gray-700 border-b border-gray-50 block active:bg-gray-50">
          📥 导入数据
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        <button onClick={() => setShowConfirm(true)} className="w-full px-4 py-3.5 text-left text-sm text-red-500 active:bg-red-50">
          🗑️ 清空所有数据
        </button>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs" onClick={e => e.stopPropagation()}>
            <h4 className="text-base font-bold text-navy mb-2">确认清空？</h4>
            <p className="text-sm text-gray-500 mb-4">此操作不可撤销，所有足迹数据将被删除。</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-600">取消</button>
              <button onClick={handleClear} className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm text-white">确认清空</button>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full">
          {msg}
        </div>
      )}
    </div>
  );
}
