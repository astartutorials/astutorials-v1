CREATE OR REPLACE FUNCTION decrement_seats_booked(tid UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE tutorials SET seats_booked = GREATEST(seats_booked - 1, 0) WHERE id = tid;
$$;
