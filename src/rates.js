const CURRENCIES = new Set(['AUD','CAD','CHF','CNY','EGP','EUR','GBP','JPY','USD']);
export async function convert({ from, to, amount, fetchFn = fetch }) {
  if (!CURRENCIES.has(from) || !CURRENCIES.has(to)) throw Object.assign(new Error('Unsupported currency code.'), { code: 'INVALID_CURRENCY' });
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) throw Object.assign(new Error('amount must be a positive number no greater than 1,000,000,000.'), { code: 'INVALID_AMOUNT' });
  if (from === to) return { rate: 1, convertedAmount: amount, source: 'identity', timestamp: new Date().toISOString() };
  const response = await fetchFn(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
  if (!response.ok) throw new Error('Rate provider unavailable.');
  const payload = await response.json(), rate = payload.rates?.[to];
  if (typeof rate !== 'number') throw new Error('Rate provider returned incomplete data.');
  return { rate, convertedAmount: Number((amount * rate).toFixed(6)), source: 'Frankfurter', timestamp: `${payload.date}T00:00:00.000Z` };
}
export async function arbitrage({ fetchFn = fetch }) {
  const [coinbase, binance] = await Promise.all([
    fetchFn('https://api.exchange.coinbase.com/products/BTC-USD/ticker'),
    fetchFn('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
  ]);
  if (!coinbase.ok || !binance.ok) throw new Error('One or more Bitcoin exchanges are unavailable.');
  const [coinbaseData, binanceData] = await Promise.all([coinbase.json(), binance.json()]);
  const coinbasePrice = Number(coinbaseData.price), binancePrice = Number(binanceData.price);
  if (!Number.isFinite(coinbasePrice) || !Number.isFinite(binancePrice)) throw new Error('An exchange returned an invalid price.');
  const difference = Math.abs(coinbasePrice - binancePrice);
  return { asset: 'BTC', currency: 'USD', exchanges: { coinbase: { pair: 'BTC-USD', price: coinbasePrice }, binance: { pair: 'BTC-USDT', price: binancePrice } }, absoluteDifference: Number(difference.toFixed(2)), percentageDifference: Number(((difference / Math.min(coinbasePrice, binancePrice)) * 100).toFixed(4)), timestamp: new Date().toISOString() };
}
