import { RedisClientType } from 'redis';
import OracleDB from 'oracledb';
import { wooApi as api } from '@/woocommerces/wooCommerceApi.woocommerce';
import { promotionEnum, jobTime } from '@config';
import cron from 'node-cron';
import moment from 'moment';

class CreatePromotionCron {
  public run(redis: RedisClientType, oracle: OracleDB.Connection) {
    cron.schedule(jobTime.WATCH_CHANGE, () => {
      this.handleChange(redis, oracle);
    });

    cron.schedule(jobTime.ADD_PRODUCT, () => {
      this.watcherQueue(redis, oracle);
    });
  }

  private async handleChange(redis: RedisClientType, oracle: OracleDB.Connection) {
    const lastEventId = await redis.get('SQ_EVENT_ID');
    if (lastEventId) {
      const sql = `
      SELECT LAST_NUMBER
        FROM user_sequences
       WHERE sequence_name = 'SQ_EVENT_ID' `;
      const res = await oracle.execute(sql, {}, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
      const eventId = res.rows[0]?.['LAST_NUMBER'] - 1;
      if (Number(lastEventId) !== eventId) {
        const eventsRawQueue = await redis.get('events:queue');
        if (eventsRawQueue) {
          const eventQueue = JSON.parse(eventsRawQueue) as number[];
          if (eventQueue.findIndex(s => s === eventId) === -1) {
            const newProductQueue = [...eventQueue, eventId];
            await redis.set('events:queue', JSON.stringify(newProductQueue));
            console.log(`[Info] Add Event ${eventId} to add events queue`);
            redis.set('SQ_EVENT_ID', eventId);
          }
        }
      }
    }
  }

  private async watcherQueue(redis: RedisClientType, oracle: OracleDB.Connection) {
    try {
      const rawEventsQueue = await redis.get('events:queue');
      if (rawEventsQueue) {
        const eventQueue = JSON.parse(rawEventsQueue);
        for (const event of eventQueue) {
          this.updateSaleEvent(redis, oracle, event);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async updateSaleEvent(redis: RedisClientType, oracle: OracleDB.Connection, eventId: number) {
    try {
      const sqlEvent = `SELECT EVENT_ID, FR_DATE, END_DATE, EVENT_DESC FROM TB_AG006 WHERE EVENT_ID = :id`;
      const eventDetail = await oracle.execute(sqlEvent, { id: eventId }, { outFormat: OracleDB.OUT_FORMAT_OBJECT });

      const webPromotionId = promotionEnum[eventDetail.rows[0]?.['EVENT_DESC'] ?? 'พิเศษช่วงนี้'];
      const dateNow = moment();
      const startDate = moment(eventDetail.rows[0]?.['FR_DATE'] ?? '');
      const endDate = moment(eventDetail.rows[0]?.['END_DATE'] ?? '');
      if (dateNow.diff(endDate) < 0) {
        try {
          const itemSql = `SELECT * FROM TB_AG014 WHERE EVENT_ID = :id`;
          const items = await oracle.execute(itemSql, { id: eventId }, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
          for (const item of items.rows) {
            const sku = item['SALE_GOOD_ID'];
            const { data } = await api.get(`products?sku=${sku}`);
            if (data.length > 0) {
              const webProduct = data[0];
              const hasKey = await redis.get(`sale:product:event:${eventId}:sku:${sku}`);
              if (!hasKey) {
                const req = {
                  regular_price: String(item['DC_PRC'] + item['DC_RNG']),
                  price: String(item['DC_PRC'] + item['DC_RNG']),
                  sale_price: String(item['DC_PRC']),
                  date_on_sale_from: startDate.format(),
                  date_on_sale_to: endDate.format(),
                  stock_quantity: item['ORD_QTY'],
                  stock_status: item['ORD_QTY'] > 0 ? 'instock' : 'outofstock',
                  tags: [webPromotionId],
                };
                if (webProduct?.variations?.length > 0) {
                  for (const variant of webProduct?.variations) {
                    const res = await api.put(`products/${webProduct?.id}/variations/${variant}`, req);
                    if (res) {
                      console.log(`[Info] update variations: ${webProduct.id} variant: ${variant} to sale_price: ${String(item['DC_PRC'])}`);
                    }
                  }
                  redis.set(`sale:product:event:${eventId}:sku:${sku}`, 'w', { EX: 30 * 24 * 60 * 60 });
                } else {
                  const res = await api.put(`products/${webProduct?.id}`, req);
                  if (res) {
                    console.log(`[Info] update: ${webProduct.id} to sale_price: ${String(item['DC_PRC'])}`);
                    redis.set(`sale:product:event:${eventId}:sku:${sku}`, 'w', { EX: 30 * 24 * 60 * 60 });
                  }
                }
              }
            } else {
              console.log(`[Info] Not Found Product SKU: ${sku}`);
            }
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log(`[Info] Promotion Event: ${eventId} Expires`);
        const eventsRawQueue = await redis.get('events:queue');
        if (eventsRawQueue) {
          const eventQueue = JSON.parse(eventsRawQueue) as number[];
          const newProductQueue = eventQueue.filter(s => s !== eventId);
          await redis.set('events:queue', JSON.stringify(newProductQueue));
          console.log(`[Info] Remove Event ${eventId} from events queue`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export default CreatePromotionCron;
