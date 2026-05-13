import { create } from 'zustand';
import type { AppData, CityRecord, Visit, VisitType } from '../types';
import { storage } from '../utils/storage';

interface AppState {
  data: AppData;
  initialized: boolean;
  selectedCityCode: string | null;
  showEntryPanel: boolean;
  showMemoryCard: boolean;

  // Actions
  initData: () => void;
  loadData: () => void;
  addCityVisit: (cityCode: string, name: string, province: string, center: [number, number], visit: Visit) => void;
  removeVisit: (cityCode: string, visitId: string) => void;
  selectCity: (code: string | null) => void;
  setEntryPanelOpen: (open: boolean) => void;
  setMemoryCardOpen: (open: boolean) => void;
  clearAllData: () => void;
  replaceData: (data: AppData) => void;
  getCityRecord: (code: string) => CityRecord | undefined;
}

function createEmptyData(): AppData {
  const now = new Date().toISOString();
  return { version: '1.0', createdAt: now, updatedAt: now, cities: [] };
}

export const useAppStore = create<AppState>((set, get) => ({
  data: createEmptyData(),
  initialized: false,
  selectedCityCode: null,
  showEntryPanel: false,
  showMemoryCard: false,

  initData: () => {
    set({ data: createEmptyData(), initialized: true });
  },

  loadData: () => {
    const loaded = storage.load();
    if (loaded) {
      set({ data: loaded, initialized: true });
    } else {
      set({ data: createEmptyData(), initialized: true });
    }
  },

  addCityVisit: (cityCode, name, province, center, visit) => {
    set((state) => {
      const updated = { ...state.data };
      let city = updated.cities.find(c => c.code === cityCode);
      if (!city) {
        city = { code: cityCode, name, province, center, visits: [] };
        updated.cities = [...updated.cities, city];
      }
      city.visits = [...city.visits, visit];
      updated.updatedAt = new Date().toISOString();
      storage.save(updated);
      return { data: updated };
    });
  },

  removeVisit: (cityCode, visitId) => {
    set((state) => {
      const updated = { ...state.data };
      const city = updated.cities.find(c => c.code === cityCode);
      if (city) {
        city.visits = city.visits.filter(v => v.id !== visitId);
        if (city.visits.length === 0) {
          updated.cities = updated.cities.filter(c => c.code !== cityCode);
        }
      }
      updated.updatedAt = new Date().toISOString();
      storage.save(updated);
      return { data: updated };
    });
  },

  selectCity: (code) => set({ selectedCityCode: code }),

  setEntryPanelOpen: (open) => set({ showEntryPanel: open }),

  setMemoryCardOpen: (open) => set({ showMemoryCard: open }),

  clearAllData: () => {
    storage.clear();
    set({ data: createEmptyData() });
  },

  replaceData: (data) => {
    storage.save(data);
    set({ data });
  },

  getCityRecord: (code) => {
    return get().data.cities.find(c => c.code === code);
  },
}));

export function useCityColor(code: string): string | undefined {
  const city = useAppStore.getState().data.cities.find(c => c.code === code);
  if (!city || city.visits.length === 0) return undefined;
  const typeColorMap: Record<VisitType, string> = {
    residence: '#3B82F6',
    education: '#10B981',
    work: '#8B5CF6',
    travel: '#F59E0B',
    transit: '#9CA3AF',
  };
  const primaryType = city.visits[city.visits.length - 1].type;
  return typeColorMap[primaryType];
}
