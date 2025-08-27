export type Ticket = {
  bookingId: number;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  tenantName: string;
  thumbnailUrl: string;
};

export type TicketDetail = {
  bookingId: string;
  event: {
    title: string;
    thumbnailUrl: string;
    eventDate: string;
    venue: {
      name: string;
    };
  };
  seat: {
    className: string;
    floor: number;
    row: string;
    col: string;
  };
  tenantName: string;
};
