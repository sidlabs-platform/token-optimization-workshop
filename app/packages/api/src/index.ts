import { createApp } from './app';
const port = Number(process.env.PORT ?? 4100);
createApp().listen(port, () => console.log(`SentinelOps API listening on ${port}`));
