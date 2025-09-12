import {Ticket} from '@/types/ticket';

export const SAMPLE_TICKETS: Ticket[] = [
  {
    bookingId: 1,
    eventTitle: '방탄소년단 Yet To Come in Cinemas',
    eventDate: '2025.09.01(월) 19:00',
    venueName: '롯데시네마 월드타워',
    tenantName: '롯데시네마',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
  },
  {
    bookingId: 2,
    eventTitle: '손흥민 자선 축구경기',
    eventDate: '2025.12.22(토) 16:00',
    venueName: '서울월드컵경기장',
    tenantName: '대한축구협회',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
  },

  // {
  //   id: '2',
  //   title: '손흥민 자선 축구경기',
  //   date: '2025.12.22(토) 16:00',
  //   location: '서울월드컵경기장',
  //   seat: '동측 2층 24구역 5열 12번',
  //   tenantName: '대한축구협회',
  //   status: 'expired',
  //   type: '스포츠',
  //   image:
  //     'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
  // },
  // {
  //   id: '3',
  //   title: '반 고흐 전시회',
  //   date: '2025.10.10(목) 13:00',
  //   location: '국립현대미술관',
  //   seat: '일반 입장권',
  //   tenantName: '국립현대미술관',
  //   status: 'used',
  //   type: '전시회',
  //   image:
  //     'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop',
  // },
  // {
  //   id: '4',
  //   title: '뮤지컬 라이온 킹',
  //   date: '2025.01.07(화) 19:00',
  //   location: '샤롯데 씨어터',
  //   seat: 'R석 1층 C열 15번',
  //   tenantName: '인터파크 티켓',
  //   status: 'active',
  //   type: '콘서트',
  //   image:
  //     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
  // },
];
