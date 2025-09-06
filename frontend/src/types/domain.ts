export type Gate = { id: string; name: string };

export type Zone = {
  id: string;
  name: string;
  category: "normal" | "special";
  open: boolean;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal?: number;
  rateSpecial?: number;
  gateId?: string;
};

export type Ticket = {
  id: string;
  code: string;
  type: "visitor" | "subscriber";
  zoneId: string;
  gateId: string;
  createdAt: string;
  subscriptionId?: string;
};
