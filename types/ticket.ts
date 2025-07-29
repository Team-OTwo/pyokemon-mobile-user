export type Ticket = {
  id: string;
  title: string;
  date: string;
  location: string;
  seat: string;
  issuer: string;
  status: "active" | "used" | "expired";
  type: string;
};
