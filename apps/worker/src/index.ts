import { createApp } from './app';
import { handleScheduled } from './scheduled';
import type { Env } from './types/env';

const app = createApp();

export default {
  // Cloudflare Workers Fetch Handler (HTTP REST API)
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  // Cloudflare Workers Scheduled Handler (Cron Triggers)
  scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    return handleScheduled(event, env, ctx);
  },
};
