const totalKey = "prospera:website-visits:total";
const sessionLifetime = 30 * 24 * 60 * 60;

// One atomic operation prevents retries or concurrent requests for a session
// from increasing the total twice. Expiring markers keep storage bounded.
const countVisit = `
if redis.call('EXISTS', KEYS[2]) == 0 then
  local total = redis.call('INCR', KEYS[1])
  redis.call('SET', KEYS[2], '1', 'EX', ARGV[1])
  return total
end
return tonumber(redis.call('GET', KEYS[1]) or '0')
`;

export async function websiteVisits(session?: string): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Visit storage is not configured.");

  const command = session
    ? ["EVAL", countVisit, 2, totalKey, `prospera:website-visits:session:${session}`, sessionLifetime]
    : ["GET", totalKey];
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Visit storage is unavailable.");
  const data: { result?: unknown; error?: string } = await response.json();
  if (data.error || !("result" in data)) throw new Error("Visit storage returned an error.");
  const total = data.result === null && !session ? 0 : Number(data.result);
  if (!Number.isSafeInteger(total) || total < 0 || (session && total === 0)) {
    throw new Error("Visit storage returned an invalid total.");
  }
  return total;
}
