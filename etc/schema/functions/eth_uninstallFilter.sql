DROP FUNCTION IF EXISTS eth_uninstallFilter(inet, bigint) RESTRICT;

CREATE FUNCTION eth_uninstallFilter(client_ip inet, filter_id bigint) RETURNS boolean AS $$
BEGIN
  DELETE FROM filter WHERE id = filter_id AND created_by = client_ip;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
