import { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { useAppStore } from '../store';
import { VISIT_TYPE_META } from '../types';

const MAP_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const geoJsonRef = useRef<any>(null);
  const dataRef = useRef(useAppStore.getState().data);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const data = useAppStore((s) => s.data);
  const selectCity = useAppStore((s) => s.selectCity);
  const setEntryPanelOpen = useAppStore((s) => s.setEntryPanelOpen);
  const setShowMemoryCard = useAppStore((s) => s.setMemoryCardOpen);

  // Build series data from current store (not reactive)
  const buildSeriesData = useCallback(() => {
    const currentData = useAppStore.getState().data;
    const colorMap: Record<string, string> = {};
    currentData.cities.forEach((city) => {
      if (city.visits.length > 0) {
        const lastType = city.visits[city.visits.length - 1].type;
        colorMap[city.code] = VISIT_TYPE_META[lastType]?.color ?? '#9CA3AF';
      }
    });

    if (!geoJsonRef.current) return [];

    return Object.entries(colorMap).map(([code, color]) => {
      const feature = geoJsonRef.current.features.find(
        (f: any) => f.properties.adcode?.toString() === code
      );
      return {
        name: feature?.properties.name || '',
        adcode: code,
        value: 1,
        itemStyle: { areaColor: color },
      };
    });
  }, []);

  // Update map colors when data changes
  useEffect(() => {
    if (chartRef.current && geoJsonRef.current) {
      chartRef.current.setOption({
        series: [{ data: buildSeriesData() }],
      });
    }
  }, [data.cities.length, buildSeriesData]);

  // Init chart once
  useEffect(() => {
    let disposed = false;

    async function init() {
      if (!mapRef.current) return;
      try {
        const res = await fetch(MAP_URL);
        const geoJson = await res.json();
        geoJsonRef.current = geoJson;
        echarts.registerMap('china', geoJson);

        const chart = echarts.init(mapRef.current);
        chartRef.current = chart;

        chart.setOption({
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(30,58,95,0.92)',
            borderColor: 'transparent',
            borderWidth: 0,
            textStyle: { color: '#fff', fontSize: 12 },
            padding: [10, 14],
            borderRadius: 8,
            formatter: (params: any) => {
              const code = params.data?.adcode?.toString() || '';
              const currentData = useAppStore.getState().data;
              const city = currentData.cities.find((c) => c.code === code);
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
              label: {
                show: true,
                color: '#B0B0B0',
                fontSize: 8,
              },
              emphasis: {
                label: { show: true, color: '#1E3A5F', fontSize: 10, fontWeight: 'bold' },
                itemStyle: {
                  areaColor: '#D1D5DB',
                  shadowColor: 'rgba(0,0,0,0.12)',
                  shadowBlur: 8,
                },
              },
              itemStyle: {
                areaColor: '#F0F0F0',
                borderColor: '#D8D8D8',
                borderWidth: 0.6,
              },
              data: buildSeriesData(),
            },
          ],
        });

        chart.on('click', (params: any) => {
          const code = params.data?.adcode?.toString();
          if (!code) return;
          const currentData = useAppStore.getState().data;
          const city = currentData.cities.find((c) => c.code === code);
          selectCity(code);
          // Clear map selection
          chart.dispatchAction({
            type: 'unselect',
            seriesIndex: 0,
          });
          if (city && city.visits.length > 0) {
            setShowMemoryCard(true);
          } else {
            setEntryPanelOpen(true);
          }
        });

        if (!disposed) {
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load map:', e);
        if (!disposed) {
          setLoading(false);
          setError(true);
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

  // Resize
  useEffect(() => {
    function handleResize() {
      chartRef.current?.resize();
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex-1 relative min-h-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FAFAF9] z-10">
          <div className="text-center">
            <div className="w-7 h-7 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[12px] text-[#9CA3AF]">地图加载中</p>
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FAFAF9] z-10">
          <div className="text-center px-6">
            <p className="text-[28px] mb-2">🗺️</p>
            <p className="text-[14px] text-[#374151] font-medium mb-1">地图加载失败</p>
            <p className="text-[12px] text-[#9CA3AF] mb-4">请检查网络连接后重试</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-[#1E3A5F] text-white text-[13px] rounded-[8px] active:bg-[#2D5A87] transition-colors"
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
