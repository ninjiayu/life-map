export type VisitType = 'residence' | 'education' | 'work' | 'travel' | 'transit';

export interface Visit {
  id: string;
  year: number;
  type: VisitType;
  memory: string;
}

export interface CityRecord {
  code: string;
  name: string;
  province: string;
  center: [number, number];
  visits: Visit[];
}

export interface AppData {
  version: string;
  createdAt: string;
  updatedAt: string;
  cities: CityRecord[];
}

export const VISIT_TYPE_META: Record<VisitType, { label: string; emoji: string; color: string }> = {
  residence: { label: '常驻', emoji: '🏠', color: '#3B82F6' },
  education: { label: '求学', emoji: '🎓', color: '#10B981' },
  work: { label: '工作/出差', emoji: '💼', color: '#8B5CF6' },
  travel: { label: '旅游', emoji: '✈️', color: '#F59E0B' },
  transit: { label: '途经', emoji: '🚗', color: '#9CA3AF' },
};

export type Route = 'map' | 'timeline' | 'settings';
