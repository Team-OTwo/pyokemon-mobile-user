import {TicketDetail} from '@/types';

export const SAMPLE_TICKET_DETAILS: TicketDetail = {
  bookingId: '1',
  event: {
    title: '방탄소년단 Yet To Come in Cinemas',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    eventDate: '2025.09.01(월) 19:00',
    venue: {
      name: '롯데시네마 월드타워',
    },
  },
  seat: {
    className: 'VIP',
    floor: 1,
    row: 'A',
    col: '1',
  },
  tenantName: '롯데시네마',
};
