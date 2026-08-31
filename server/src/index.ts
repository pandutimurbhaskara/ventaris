import { createApp } from "./app";
import { env } from "./config/env";
import { migrate } from "./db/migrate";
import { seed } from "./db/seed";

migrate();
seed();

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port} (${env.nodeEnv})`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  });
}
