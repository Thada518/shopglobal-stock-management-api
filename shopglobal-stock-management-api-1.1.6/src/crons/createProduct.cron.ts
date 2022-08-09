import axios, { AxiosInstance } from 'axios';
import { RedisClientType } from 'redis';
import { PORT, jobTime, categories as categoriesEnum } from '@config';
import OracleDB from 'oracledb';
import { wooApi as api } from '@/woocommerces/wooCommerceApi.woocommerce';
import cron from 'node-cron';
class CreateProduct {
  public createProductRunning = false;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `http://localhost:${PORT}`,
    });
  }

  public run(redis: RedisClientType, oracle: OracleDB.Connection) {
    cron.schedule(jobTime.WATCH_CHANGE, () => {
      this.handleChange(redis, oracle);
    });

    cron.schedule(jobTime.ADD_PRODUCT, () => {
      this.watcherQueue(redis, oracle);
    });
  }

  private async handleChange(redis: RedisClientType, oracle: OracleDB.Connection) {
    const lastSaleGoodProduct = await redis.get('SQ_GOOD_ID');
    if (lastSaleGoodProduct) {
      const sql = `
      SELECT LAST_NUMBER
        FROM user_sequences
       WHERE sequence_name = 'SQ_GOOD_ID' `;
      const res = await oracle.execute(sql, {}, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
      const goodIdNumber = res.rows[0]?.['LAST_NUMBER'] - 1;
      if (Number(lastSaleGoodProduct) !== goodIdNumber) {
        const productRawQueue = await redis.get('products:queue');
        if (productRawQueue) {
          const productQueue = JSON.parse(productRawQueue) as number[];
          if (productQueue.findIndex(s => s === goodIdNumber) === -1) {
            const newProductQueue = [...productQueue, goodIdNumber];
            await redis.set('products:queue', JSON.stringify(newProductQueue));
            console.log(`[Info] Add SKU ${goodIdNumber} to add products queue`);
            redis.set('SQ_GOOD_ID', goodIdNumber);
          }
        }
      }
    }
  }

  private async watcherQueue(redis: RedisClientType, oracle: OracleDB.Connection) {
    try {
      const rawProductsQueue = await redis.get('products:queue');
      if (rawProductsQueue) {
        const productQueue = JSON.parse(rawProductsQueue);
        for (const sku of productQueue) {
          const { data: existing } = await api.get(`products?sku=${sku}`);
          if (existing.length) {
            console.log(`[Info] Skip Create SKU ${sku} Reason: Product Already Exist`);
            const newProductQueue = productQueue.filter(s => s !== sku);
            await redis.set('products:queue', JSON.stringify(newProductQueue));
            console.log(`[Info] Remove SKU ${sku} from add products queue`);
          } else {
            this.AddProduct(redis, oracle, { sku });
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async AddProduct(redis: RedisClientType, oracle: OracleDB.Connection, args: { sku: number }) {
    try {
      const { data } = await this.axiosInstance.get(`shop/product-details-by-salegood-id/${args.sku}`);
      const details = data?.data ?? null;
      if (details && details.length > 0) {
        const detail = details[0];
        const sqlPrice = `SELECT PRC, GOOD_APPR_CD FROM TB_AG001 WHERE GOOD_ID = :goodId`;
        const priceRows = await oracle.execute(sqlPrice, { goodId: Number(`${500}${args.sku}`) }, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
        const approveCd = priceRows.rows[0]['GOOD_APPR_CD'] ?? '10';
        if (approveCd === '50') {
          const price = priceRows.rows[0]['PRC'] ?? 0;
          const name = detail['NAME'] === 'undefined' ? 'สินค้าไม่มีชื่อ' : detail['NAME'];
          const req = {
            name: name,
            type: detail['OPTIONS'] > 1 ? 'variable' : 'simple',
            description: String(detail['PROPERTY']),
            sku: String(args.sku),
            regular_price: `${price}`,
          };
          const res = await this.axiosInstance.post('woocommerce/create-product', req);
          if (res?.data) {
            console.log(`[Info] CreateProduct SKU: ${args.sku} ${res.data}`);
            if (detail['OPTIONS'].length > 1) {
              try {
                const { data } = await api.get(`products?sku=${args.sku}`);
                const item = data?.[0];
                for (const option of detail['OPTIONS']) {
                  const attributes = [
                    {
                      option:
                        option['SELL_COLOR_DESC'] !== 'Common'
                          ? option['SELL_COLOR_DESC']
                          : option['SELL_STYLE_DESC'] !== 'Common'
                          ? option['SELL_STYLE_DESC']
                          : 'ทั่วไป',
                    },
                  ];
                  const skuItem = option['SALE_SKU_ID'];
                  const res = await api.post(`products/${item?.id}/variations`, {
                    attributes,
                    skuItem,
                  });
                  if (res) {
                    console.log(`[res] ${res.data}`);
                    console.log(`[Info] Create Variation SKU: ${args.sku}`);
                  }
                }
                this.updateToDraft(args.sku);
                this.updateCategories(args.sku, detail?.['CATEGORY']?.[0] ?? '');
              } catch (error) {
                console.error(error);
              }
            } else {
              this.updateCategories(args.sku, detail?.['CATEGORY']?.[0] ?? '');
              this.updateToDraft(args.sku);
            }
            const productRawQueue = await redis.get('products:queue');
            if (productRawQueue) {
              const productQueue = JSON.parse(productRawQueue) as number[];
              const newProductQueue = productQueue.filter(s => s !== args.sku);
              await redis.set('products:queue', JSON.stringify(newProductQueue));
              console.log(`[Info] Remove SKU ${args.sku} from add products queue`);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async updateToDraft(sku) {
    const status = 'draft';
    const { data } = await api.get(`products?sku=${sku}`);
    const req = {
      status,
    };
    const res = await api.put(`products/${data?.[0].id}`, req);
    if (res) {
      console.log(`[Info] update: ${data?.[0].id} status: ${status}`);
    }
  }

  private async updateCategories(sku, categorie) {
    const { data } = await api.get(`products?sku=${sku}`);
    const categories = categoriesEnum[categorie] ?? { id: 133 };
    const req = {
      categories: [categories],
    };
    const res = await api.put(`products/${data?.[0].id}`, req);
    if (res) {
      console.log(`[Info] update: ${data?.[0].id} categories: ${categories}`);
    }
  }
}

export default CreateProduct;
