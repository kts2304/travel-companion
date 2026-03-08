export interface Trip {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface CreateTripInput {
  name: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
}
