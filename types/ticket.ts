export type Ticket = {
  bookingId: string;
  eventTitle: string;
  eventDate: string;
  tenantName: string;
  venueName: string;
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
