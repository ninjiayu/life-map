import { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { useAppStore } from '../store';
import { VISIT_TYPE_META } from '../types';

// Load prefecture-level GeoJSON from Vite public dir (no CORS issues)
const MAP_URL = import.meta.env.BASE_URL + 'china-prefectures.json';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const cities = useAppStore((s) => s.data.cities);
  const selectCity = useAppStore((s) => s.selectCity);
  const setShowMemoryCard = useAppStore((s) => s.setMemoryCardOpen);

  // Build map series data — match by adcode
  const buildSeriesData = useCallback(() => {
    return cities
      .filter((c) => c.visits.length > 0)
      .map((c) => {
        const lastType = c.visits[c.visits.length - 1].type;
        return {
          name: c.code,
          itemStyle: {
            areaColor: VISIT_TYPE_META[lastType]?.color || '#9CA3AF',
          },
        };
      });
  }, [cities]);

  // Init chart once
  useEffect(() => {
    let disposed = false;

    async function init() {
      if (!mapRef.current) return;
      try {
        const res = await fetch(MAP_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
        const geoJson = await res.json();
        echarts.registerMap('china', geoJson);

        const chart = echarts.init(mapRef.current);
        chartRef.current = chart;

        chart.setOption({
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(30,58,95,0.92)',
            borderColor: 'transparent',
            textStyle: { color: '#fff', fontSize: 12 },
            padding: [10, 14],
            borderRadius: 8,
            formatter: (params: any) => {
              const code = params.name;
              const city = cities.find((c) => c.code === code);
              if (city && city.visits.length > 0) {
                const lines = city.visits
                  .map(
                    (v) =>
                      `${VISIT_TYPE_META[v.type]?.emoji} ${v.year}年 · ${VISIT_TYPE_META[v.type]?.label}`
                  )
                  .join('<br/>');
                return `<div style="font-weight:600;font-size:13px;margin-bottom:4px">${city.name}</div><div style="opacity:0.6;font-size:11px">${city.province}</div><div style="margin-top:6px">${lines}</div>`;
              }
              return `<div style="font-weight:600">${params.name}</div><div style="opacity:0.6;font-size:11px;margin-top:4px">点击添加</div>`;
            },
          },
          series: [
            {
              name: '人生履迹',
              type: 'map',
              map: 'china',
              roam: true,
              zoom: 1.1,
              center: [104, 36],
              scaleLimit: { min: 0.8, max: 6 },
              label: { show: true, color: '#B0B0B0', fontSize: 8 },
              emphasis: {
                label: { show: true, color: '#1E3A5F', fontSize: 10, fontWeight: 'bold' },
                itemStyle: { areaColor: '#D1D5DB', shadowColor: 'rgba(0,0,0,0.12)', shadowBlur: 8 },
              },
              itemStyle: { areaColor: '#EAE8E3', borderColor: '#D5D2CC', borderWidth: 0.6 },
              data: buildSeriesData(),
            },
          ],
        });

        chart.on('click', (params: any) => {
          const code = params.name;
          if (!code) return;
          const city = cities.find((c) => c.code === code);
          selectCity(code);
          if (city && city.visits.length > 0) {
            setShowMemoryCard(true);
          } else {
            // Open entry panel pre-filled with this city
            useAppStore.getState().setEntryPanelOpen(true);
          }
        });

        if (!disposed) setLoading(false);
      } catch (e: any) {
        console.error('Failed to load map:', e);
        if (!disposed) {
          setLoading(false);
          setError(true);
          setErrMsg(e?.message || '未知错误');
        }
      }
    }

    init();
    return () => {
      disposed = true;
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  // Update data when cities change
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption({
        series: [{ data: buildSeriesData() }],
      });
    }
  }, [buildSeriesData]);

  // Resize
  useEffect(() => {
    const h = () => chartRef.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  return (
    <div className="flex-1 relative min-h-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F7F6F2] z-10">
          <div className="w-7 h-7 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[12px] text-[#9CA3AF]">地图加载中</p>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F7F6F2] z-10">
          <div className="text-center px-6">
            <p className="text-[28px] mb-2">🗺️</p>
            <p className="text-[14px] text-[#374151] font-medium mb-1">地图加载失败</p>
            <p className="text-[12px] text-[#9CA3AF] mb-4">{errMsg}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-[#1E3A5F] text-white text-[13px] rounded-[8px] active:bg-[#2D5A87]"
            >
              重新加载
            </button>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
