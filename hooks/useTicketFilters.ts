import { Ticket } from '@/types/ticket';
import { FilterOptions } from '@/utils/ticket.utils';
import { useMemo, useState } from 'react';

export interface FilterOption {
  label: string;
  value: string | null;
}

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
