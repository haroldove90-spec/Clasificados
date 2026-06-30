export type AppView = 'home' | 'emergency' | 'available' | 'map';

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  distance: string;
  rating: number;
  status: 'pending' | 'accepted' | 'arriving' | 'arrived';
  avatar: string;
}

export interface ActiveAlert {
  id: string;
  title: string;
  description: string;
  distance: string;
  category: 'plumbing' | 'electricity' | 'locksmith' | 'gas';
  payout: number;
  timeAgo: string;
}
