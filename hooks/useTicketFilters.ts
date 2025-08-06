import { Ticket } from '@/types/ticket';
import { useMemo, useState } from 'react';

export interface FilterOption {
  label: string;
  value: string | null;
}

export const FilterOptions: FilterOption[] = [
  { label: '전체', value: null },
  { label: '콘서트', value: 'concert' },
  { label: '뮤지컬', value: 'musical' },
  { label: '연극', value: 'drama' },
  { label: '클래식', value: 'classic' },
];

export const useTicketFilters = (tickets: Ticket[]) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const filteredTickets = useMemo(() => {
    return activeFilter
      ? tickets.filter(ticket => ticket.type === activeFilter)
      : tickets;
  }, [tickets, activeFilter]);

  const handleVCStatusChange = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return {
    filteredTickets,
    activeFilter,
    setActiveFilter,
    filterOptions: FilterOptions,
    refreshKey,
    handleVCStatusChange,
  };
};
