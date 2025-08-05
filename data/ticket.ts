import { Ticket } from '@/types/ticket';

export const SAMPLE_TICKETS: Ticket[] = [
  {
    id: '1',
    title: 'BTS 월드투어 2023',
    date: '2023년 12월 15일 19:30',
    location: '서울 올림픽 주경기장',
    seat: '스탠딩 A구역 12번',
    issuer: 'Ticketmaster Korea',
    status: 'active',
    type: 'concert',
  },
  {
    id: '2',
    title: '손흥민 자선 축구경기',
    date: '2025.12.22(토) 16:00',
    location: '서울월드컵경기장',
    seat: '동측 2층 24구역 5열 12번',
    issuer: '대한축구협회',
    status: 'expired',
    type: 'sports',
  },
  {
    id: '3',
    title: '반 고흐 전시회',
    date: '2025.10.10(목) 13:00',
    location: '국립현대미술관',
    seat: '일반 입장권',
    issuer: '국립현대미술관',
    status: 'used',
    type: 'exhibition',
  },
  {
    id: '4',
    title: '뮤지컬 라이온 킹',
    date: '2025.01.07(화) 19:00',
    location: '샤롯데 씨어터',
    seat: 'R석 1층 C열 15번',
    issuer: '인터파크 티켓',
    status: 'active',
    type: 'concert',
  },
];
