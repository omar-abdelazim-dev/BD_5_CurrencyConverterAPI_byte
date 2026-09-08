async function getJson(url, fetchImpl = fetch) {
  const response = await fetchImpl(url, { headers: { Accept: 'application/json', 'User-Agent': 'BYTE-Arbitrage-Tracker/1.0' }, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return response.json();
}
export function liveProviders(fetchImpl = fetch) {
  return {
    async fiat(from, to) {
      const body = await getJson(`https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, fetchImpl);
      const rate = body.rates?.[to]; if (!Number.isFinite(rate)) throw new Error('Rate unavailable');
      return { rate, source: 'Frankfurter (European Central Bank reference rates)', timestamp: `${body.date}T16:00:00Z` };
    },
    async bitcoin() {
      const [binance, coinbase] = await Promise.all([
        getJson('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', fetchImpl),
        getJson('https://api.coinbase.com/v2/prices/BTC-USD/spot', fetchImpl)
      ]);
      return { binance: Number(binance.price), coinbase: Number(coinbase.data?.amount), timestamp: new Date().toISOString() };
    }
  };
}
