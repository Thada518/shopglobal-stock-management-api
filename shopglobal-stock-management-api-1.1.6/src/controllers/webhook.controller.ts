import { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } from '@config';
import { createClient, RedisClientType } from 'redis';
import { NextFunction, Request, Response } from 'express';

class WebhookController {
  public setOrderTempData = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const client = createClient({
        url: `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
      });
      await client.connect();
      console.log('[Info] Redis Connection established');
      if (body && body?.line_items) {
        const lineItems = body?.line_items;
        if (lineItems.length > 0) {
          for (const lineItem of lineItems) {
            const key = `order:done:${lineItem.product_id}`;
            client.set(key, JSON.stringify(lineItem), { EX: 86400 });
            console.log('[Info] set order booking from webhook callback id: ', lineItem.product_id);
          }
        }
        setTimeout(() => {
          client.disconnect();
          console.log('[Info] Redis Connection disconnected');
        }, 15 * 1000);
      }
      res.status(200).json({ error: 0, message: 'success' });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
      console.log(error);
    }
  };
}

export default WebhookController;
