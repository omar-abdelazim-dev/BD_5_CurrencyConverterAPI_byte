# Arbitrage Currency Converter API

B.Y.T.E Backend Task 5, deployed as a Vercel-ready serverless API. It converts supported currencies using live exchange data and compares live Bitcoin pricing from Coinbase and Binance.

## Endpoints

```bash
curl 'https://YOUR-APP.vercel.app/api/convert?from=USD&to=EUR&amount=100'
curl 'https://YOUR-APP.vercel.app/api/arbitrage/btc'
```

The conversion response contains the exchange rate, converted value, provider, and rate timestamp. The arbitrage endpoint returns both exchange prices and their percentage difference. Invalid currency codes and provider failures return JSON errors.

```bash
npm install
npm test
npm start
```
