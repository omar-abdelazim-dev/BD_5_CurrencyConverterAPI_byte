import { createApp } from './app.js';
const app = createApp();
if (!process.env.VERCEL) app.listen(Number(process.env.PORT ?? 3000), () => console.log('Arbitrage Tracker API running.'));
export default app;
