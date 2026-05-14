import { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { useAppStore } from '../store';
import { VISIT_TYPE_META } from '../types';

const MAP_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const geoJsonRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const data = useAppStore((s) => s.data);
  const selectCity = useAppStore((s) => s.selectCity);
  const setEntryPanelOpen = useAppStore((s) => s.setEntryPanelOpen);
  const setMemoryCardOpen = useAppStore((s) => s.setMemoryCardOpen);
  const setShowMemoryCard = useAppStore((s) => s.setMemoryCardOpen);

  // Build color + series data
  const buildSeriesData = useCallback(() => {
    const colorMap: Record<string, string> = {};
    data.cities.forEach((city) => {
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
  }, [data.cities]);

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
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            textStyle: { color: '#374151', fontSize: 13 },
            formatter: (params: any) => {
              const code = params.data?.adcode?.toString() || '';
              const city = data.cities.find((c) => c.code === code);
              if (city && city.visits.length > 0) {
                const lines = city.visits
                  .map(
                    (v) =>
                      `${VISIT_TYPE_META[v.type]?.emoji} ${v.year}年 · ${VISIT_TYPE_META[v.type]?.label}`
                  )
                  .join('<br/>');
                return `<strong style="font-size:14px">${city.name}</strong><br/><span style="color:#9CA3AF;font-size:11px">${city.province}</span><br/>${lines}`;
              }
              return `<strong>${params.name}</strong><br/><span style="color:#9CA3AF">点击添加记录</span>`;
            },
          },
          series: [
            {
              name: '人生履迹',
              type: 'map',
              map: 'china',
              roam: true,
              zoom: 1.15,
              center: [104, 36],
              scaleLimit: { min: 0.8, max: 5 },
              label: {
                show: true,
                color: '#9CA3AF',
                fontSize: 8,
              },
              emphasis: {
                label: { show: true, color: '#1E3A5F', fontSize: 10, fontWeight: 'bold' },
                itemStyle: {
                  areaColor: '#D1D5DB',
                  shadowColor: 'rgba(0,0,0,0.15)',
                  shadowBlur: 10,
                },
              },
              itemStyle: {
                areaColor: '#F0F0F0',
                borderColor: '#D1D5DB',
                borderWidth: 0.8,
                borderRadius: 2,
              },
              select: {
                itemStyle: { areaColor: '#B0BEC5' },
                label: { show: true, color: '#1E3A5F' },
              },
              data: [],
            },
          ],
        });

        chart.on('click', (params: any) => {
          const code = params.data?.adcode?.toString();
          if (!code) return;
          const city = data.cities.find((c) => c.code === code);
          selectCity(code);
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
              className="px-5 py-2 bg-[#1E3A5F] text-white text-[13px] rounded-[8px] hover:bg-[#2D5A87] transition-colors"
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
