import axios, { AxiosInstance } from 'axios';
import { wooApi as api } from '@/woocommerces/wooCommerceApi.woocommerce';
import { PORT, jobTime, categories } from '@config';
import cron from 'node-cron';

class SSVCron {
  private axiosInstance: AxiosInstance;
  private getWeeklyEndPoint = '/shop/salegood-id-by-date';

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `http://localhost:${PORT}`,
    });
  }

  public run() {
    setTimeout(() => {
      cron.schedule(jobTime.SSV_CRON_JOB, () => {
        this.handlerCron();
      });
    }, 5000);
  }

  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getDate() {
    const d = new Date();
    const year = d.getFullYear().toString();
    let month = (d.getMonth() + 1).toString();
    const date = d.getDate();
    const day = d.getDay();
    const weekOfMonth = Math.ceil((date - 1 - day) / 7);
    let numOfWeek = 0;
    if (month.length < 2) {
      month = `0${month}`;
    }
    if (weekOfMonth === 4) {
      numOfWeek = 1;
    } else {
      numOfWeek = weekOfMonth + 1;
    }

    return {
      date: `${year}${month}01`,
      numOfWeek: numOfWeek,
    };
  }

  private async handlerCron() {
    const { date, numOfWeek } = this.getDate();
    try {
      const { data } = await this.axiosInstance.get(`${this.getWeeklyEndPoint}/${date}/${numOfWeek}`);
      if (data?.data?.length > 0) {
        for (const item of data.data) {
          this.sleep(10);
          console.log(`[Info] Add New SKU: ${item['SALE_GOOD_ID']} to SSV Watch Queue`);
          this.handlerSku(item['SALE_GOOD_ID']);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  private async handlerSku(sku) {
    try {
      const { data } = await api.get(`products?sku=${sku}`);
      if (data?.length > 0) {
        this.sleep(2000);
        this.updateProduct(data?.[0]);
      } else {
        this.sleep(200);
        this.AddProduct(sku);
      }
    } catch (error) {
      console.error('err', error);
    }
  }

  private async updateProduct(item, status = 'publish') {
    try {
      if (status !== 'publish') {
        const req = {
          status,
        };
        const res = await api.put(`products/${item?.id}`, req);
        if (res) {
          console.log(`[Info] update: ${item.id} status: ${status}`);
        }
      }

      const { data } = await this.axiosInstance.get(`shop/discount-price-by-salegood-id/${item?.sku}`);
      const discount = data?.data?.[0] ?? null;
      if (discount) {
        const { data } = await this.axiosInstance.get(`shop/promotion-by-event-id/${discount['EVENT_ID']}`);
        if (data?.data) {
          const promotion = data?.data[0];
          // update product
          const req = {
            regular_price: String(discount['DC_PRC'] + discount['DC_RNG']),
            price: String(discount['DC_PRC'] + discount['DC_RNG']),
            sale_price: String(discount['DC_PRC']),
            date_on_sale_from: promotion['FR_DATE'],
            date_on_sale_to: promotion['END_DATE'],
            stock_quantity: discount['ORD_QTY'],
            stock_status: discount['ORD_QTY'] > 0 ? 'instock' : 'outofstock',
            status: status,
          };
          this.sleep(2000);
          if (item?.variations?.length > 0) {
            for (const variant of item?.variations) {
              const res = await api.put(`products/${item?.id}/variations/${variant}`, req);
              if (res) {
                console.log(
                  `[Info] update variations: ${item.id} variant: ${variant} to sale_price: ${String(discount['DC_PRC'])} status: ${status}`,
                );
              }
            }
          } else {
            const res = await api.put(`products/${item?.id}`, req);
            if (res) {
              console.log(`[Info] update: ${item.id} to sale_price: ${String(discount['DC_PRC'])} status: ${status}`);
            }
          }
          this.sleep(3000);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async AddProduct(sku) {
    try {
      const { data } = await this.axiosInstance.get(`shop/product-details-by-salegood-id/${sku}`);
      const details = data?.data ?? null;
      if (details && details.length > 0) {
        const detail = details[0];
        const req = {
          name: String(detail['NAME']),
          type: detail['OPTIONS'] > 1 ? 'variable' : 'simple',
          description: String(detail['PROPERTY']),
          sku: String(sku),
          regular_price: '',
        };
        const res = await this.axiosInstance.post('woocommerce/create-product', req);
        if (res?.data) {
          console.log(`[Info] CreateProduct SKU: ${sku} ${res.data}`);
          if (detail['OPTIONS'].length > 1) {
            try {
              const { data } = await api.get(`products?sku=${sku}`);
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
                  console.log(`[Info] Create Variation SKU: ${sku}`);
                }
              }
              const { data: product } = await api.get(`products?sku=${sku}`);
              this.updateProduct(product?.[0], 'draft');
            } catch (error) {
              console.error(error);
            }
          } else {
            const { data: item } = await api.get(`products?sku=${sku}`);
            this.updateProduct(item?.[0], 'draft');
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export default SSVCron;
