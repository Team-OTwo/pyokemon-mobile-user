export type Ticket = {
  id: string;
  title: string;
  date: string;
  location: string;
  seat: string;
  tenantName: string;
  status: 'active' | 'used' | 'expired' | 'pending' | 'cancelled';
  type: string;
  image?: string;
};
