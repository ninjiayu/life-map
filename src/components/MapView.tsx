import { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { useAppStore } from '../store';
import { VISIT_TYPE_META } from '../types';

const MAP_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cities = useAppStore((s) => s.data.cities);
  const selectCity = useAppStore((s) => s.selectCity);
  const setEntryPanelOpen = useAppStore((s) => s.setEntryPanelOpen);
  const setShowMemoryCard = useAppStore((s) => s.setMemoryCardOpen);

  // Build scatter data for visited cities
  const scatterData = useCallback(() => {
    return cities
      .filter(c => c.visits.length > 0)
      .map(c => {
        const lastType = c.visits[c.visits.length - 1].type;
        const color = VISIT_TYPE_META[lastType]?.color || '#9CA3AF';
        return {
          name: c.name,
          code: c.code,
          value: [...c.center, 1],
          itemStyle: { color },
          symbolSize: 12,
        };
      });
  }, [cities]);

  // Build province-level choropleth data (for background)
  const provinceData = useCallback(() => {
    const provinceColors: Record<string, string> = {};
    cities.forEach(c => {
      if (c.visits.length > 0) {
        const lastType = c.visits[c.visits.length - 1].type;
        const color = VISIT_TYPE_META[lastType]?.color || '#9CA3AF';
        provinceColors[c.province] = color;
      }
    });
    return Object.entries(provinceColors).map(([name, color]) => ({
      name,
      itemStyle: { areaColor: color, opacity: 0.4 },
    }));
  }, [cities]);

  // Init chart once
  useEffect(() => {
    let disposed = false;

    async function init() {
      if (!mapRef.current) return;
      try {
        const res = await fetch(MAP_URL);
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
            padding: [8, 12],
            borderRadius: 8,
          },
          series: [
            // Province choropleth (background)
            {
              name: '省份',
              type: 'map',
              map: 'china',
              roam: true,
              zoom: 1.1,
              center: [104, 36],
              scaleLimit: { min: 0.6, max: 5 },
              label: { show: false },
              itemStyle: {
                areaColor: '#EAE8E3',
                borderColor: '#D5D2CC',
                borderWidth: 1,
              },
              emphasis: {
                itemStyle: { areaColor: '#D5D2CC' },
                label: { show: false },
              },
              data: provinceData(),
            },
            // Scatter points for visited cities
            {
              name: '城市',
              type: 'scatter',
              coordinateSystem: 'geo',
              data: scatterData(),
              symbolSize: 14,
              label: {
                show: true,
                formatter: '{b}',
                position: 'right',
                fontSize: 10,
                color: '#374151',
                fontWeight: '500',
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: [2, 4],
                borderRadius: 3,
              },
              emphasis: {
                scale: true,
                symbolSize: 18,
                label: { fontSize: 12 },
              },
            },
          ],
        });

        chart.on('click', (params: any) => {
          if (params.componentType === 'series' && params.seriesName === '城市') {
            const code = params.data?.code;
            if (code) {
              const city = cities.find(c => c.code === code);
              selectCity(code);
              chart.dispatchAction({ type: 'unselect', seriesIndex: 0 });
              if (city && city.visits.length > 0) {
                setShowMemoryCard(true);
              }
            }
          } else if (params.componentType === 'series' && params.seriesName === '省份') {
            // Clicked on province - open entry panel
            setEntryPanelOpen(true);
          }
        });

        if (!disposed) setLoading(false);
      } catch (e) {
        console.error('Failed to load map:', e);
        if (!disposed) { setLoading(false); setError(true); }
      }
    }

    init();
    return () => { disposed = true; chartRef.current?.dispose(); chartRef.current = null; };
  }, []);

  // Update data
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption({
        series: [
          { data: provinceData() },
          { data: scatterData() },
        ],
      });
    }
  }, [cities.length, scatterData, provinceData]);

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
          <div className="text-center">
            <div className="w-7 h-7 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[12px] text-[#9CA3AF]">地图加载中</p>
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F7F6F2] z-10">
          <div className="text-center px-6">
            <p className="text-[28px] mb-2">🗺️</p>
            <p className="text-[14px] text-[#374151] font-medium mb-1">地图加载失败</p>
            <button onClick={() => window.location.reload()} className="px-5 py-2 bg-[#1E3A5F] text-white text-[13px] rounded-[8px] active:bg-[#2D5A87]">重新加载</button>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
