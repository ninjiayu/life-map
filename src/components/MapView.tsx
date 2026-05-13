import { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { useAppStore } from '../store';
import { VISIT_TYPE_META } from '../types';

// Map GeoJSON URL - DataV Alibaba
const MAP_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const data = useAppStore((s) => s.data);
  const selectCity = useAppStore((s) => s.selectCity);
  const setEntryPanelOpen = useAppStore((s) => s.setEntryPanelOpen);
  const setMemoryCardOpen = useAppStore((s) => s.setMemoryCardOpen);

  const colorMap: Record<string, string> = {};
  data.cities.forEach((city) => {
    if (city.visits.length > 0) {
      const lastType = city.visits[city.visits.length - 1].type;
      colorMap[city.code] = VISIT_TYPE_META[lastType]?.color ?? '#9CA3AF';
    }
  });

  const initMap = useCallback(async () => {
    if (!mapRef.current || chartRef.current) return;
    try {
      const res = await fetch(MAP_URL);
      const geoJson = await res.json();
      echarts.registerMap('china', geoJson);
      const chart = echarts.init(mapRef.current);
      chartRef.current = chart;

      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const code = params.data?.adcode?.toString() || '';
            const city = data.cities.find(c => c.code === code);
            if (city && city.visits.length > 0) {
              const types = city.visits.map(v => VISIT_TYPE_META[v.type]?.emoji + ' ' + VISIT_TYPE_META[v.type]?.label).join('<br/>');
              return `<strong>${city.name}</strong><br/>${types}`;
            }
            return params.name;
          },
        },
        series: [{
          name: '人生履迹',
          type: 'map',
          map: 'china',
          roam: true,
          zoom: 1.2,
          label: {
            show: false,
          },
          itemStyle: {
            areaColor: '#E5E7EB',
            borderColor: '#D1D5DB',
            borderWidth: 1,
          },
          emphasis: {
            itemStyle: {
              areaColor: '#D1D5DB',
            },
            label: {
              show: true,
              color: '#374151',
            },
          },
          select: {
            itemStyle: {
              areaColor: '#9CA3AF',
            },
          },
          data: Object.entries(colorMap).map(([code, color]) => ({
            name: geoJson.features.find((f: any) => f.properties.adcode?.toString() === code)?.properties.name || '',
            value: 1,
            adcode: code,
            itemStyle: { areaColor: color },
          })),
        }],
      });

      chart.on('click', (params: any) => {
        const code = params.data?.adcode?.toString();
        if (code) {
          const city = data.cities.find(c => c.code === code);
          selectCity(code);
          if (city && city.visits.length > 0) {
            setMemoryCardOpen(true);
          } else {
            setEntryPanelOpen(true);
          }
        }
      });

      setMapReady(true);
      setLoading(false);
    } catch (e) {
      console.error('Failed to load map:', e);
      setLoading(false);
    }
  }, [data.cities]);

  useEffect(() => {
    initMap();
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [initMap]);

  useEffect(() => {
    if (chartRef.current && mapReady) {
      const seriesData = Object.entries(colorMap).map(([code, color]) => ({
        name: '',
        value: 1,
        adcode: code,
        itemStyle: { areaColor: color },
      }));
      chartRef.current.setOption({
        series: [{ data: seriesData }],
      });
    }
  }, [data.cities, mapReady]);

  const handleResize = useCallback(() => {
    chartRef.current?.resize();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <div className="flex-1 relative min-h-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-warm-white z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">地图加载中...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '300px' }} />
    </div>
  );
}
