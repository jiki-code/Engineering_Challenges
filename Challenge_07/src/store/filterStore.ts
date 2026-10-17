import { create } from 'zustand';
import type { ClaimStatus, ClaimType, FilterState } from '../types';

interface FilterStore extends FilterState {
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  setClaimTypes: (v: ClaimType[]) => void;
  setInsurers: (v: string[]) => void;
  setCountries: (v: string[]) => void;
  setStatuses: (v: ClaimStatus[]) => void;
  setSelectedDiagnosis: (v: string | null) => void;
  clearAll: () => void;
}

const DEFAULT: FilterState = {
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  claimTypes: [],
  insurers: [],
  countries: [],
  statuses: [],
  selectedDiagnosis: null,
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT,
  setDateFrom: (v) => set({ dateFrom: v }),
  setDateTo: (v) => set({ dateTo: v }),
  setClaimTypes: (v) => set({ claimTypes: v }),
  setInsurers: (v) => set({ insurers: v }),
  setCountries: (v) => set({ countries: v }),
  setStatuses: (v) => set({ statuses: v }),
  setSelectedDiagnosis: (v) => set({ selectedDiagnosis: v }),
  clearAll: () => set({ ...DEFAULT }),
}));
