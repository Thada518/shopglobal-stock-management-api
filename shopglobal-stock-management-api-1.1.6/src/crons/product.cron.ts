import { RedisClientType } from 'redis';
import { jobTime } from '@config';
import { wooApi as api } from '@/woocommerces/wooCommerceApi.woocommerce';
import WeeklyItemsService from '@services/weekly-items.service';
import cron from 'node-cron';
class ProductConjob {
  public redis;
  public updateStockPrepareRunning = false;
  public updateStockModeResetRunning = false;
  public service = new WeeklyItemsService();

  public run(redis: RedisClientType) {
    setTimeout(() => {
      cron.schedule(jobTime.UPDATE_STOCK_MODE_PREPARE, () => {
        this.updateStockModePrepare(redis);
      });
    }, 5000);
    setTimeout(() => {
      cron.schedule(jobTime.UPDATE_STOCK_MODE_RESET, () => {
        this.updateStockModeReset(redis);
      });
    }, 5000);
    this.updateStockModePrepare(redis);
  }

  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  private updateStockModePrepare = async (redis: RedisClientType) => {
    try {
      console.log('[Info] Start Update Stock Mode Prepare');
      if (this.updateStockPrepareRunning) {
        console.log('[Info] Update Stock is running');
        return;
      }

      this.updateStockPrepareRunning = true;
      for (let i = 1; i < 3000; i++) {
        let data = [];
        const rawProducts = await redis.get(`product:page:slug:${i}`);
        if (!rawProducts) {
          const { data: webProducts } = await api.get(`products?page=${i}&per_page=10`);
          data = webProducts;
          redis.set(`product:page:slug:${i}`, JSON.stringify(webProducts));
        } else {
          data = JSON.parse(rawProducts);
        }
        for (const item of data) {
          await this.sleep(200);
          const hasWatch = await redis.get(`cronjob:updatestock:prepare:${item?.sku}`);
          if (!hasWatch) {
            console.log('[Info] Watch New Job Stock for product SKU: ', item?.sku);
            if (item?.sku?.length === 6) {
              if (item?.variations?.length > 0) {
                const shop22Stock = await this.service.getStockQtyByItemSaleGoodId(Number(item?.sku));
                if (shop22Stock.length > 0) {
                  for (const subItem of shop22Stock) {
                    console.log(`[Info] Watch a sub item sku: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']}`);
                    let product = [];
                    const rawProduct = await redis.get(`product:sku:${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']}`);
                    if (!rawProduct) {
                      const { data: webProduct } = await api.get(`products?sku=${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']}`);
                      product = webProduct;
                      redis.set(`product:sku:${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']}`, JSON.stringify(product));
                    } else {
                      product = JSON.parse(rawProduct);
                    }
                    if (product[0]?.id) {
                      const raw = (await redis.get(`order:done:${data[0]?.id}`)) ?? '{}';
                      const orderTaked = JSON.parse(raw ?? '{}');
                      const shopStock = Number(subItem['ORD_POSS_QTY']) ?? 0;
                      const webStock = Number(product[0]?.stock_quantity) ?? 0;
                      if (webStock > shopStock && product[0]?.id && item?.id) {
                        if (orderTaked && orderTaked?.quantity) {
                          const taked = Number(orderTaked?.quantity);
                          const sumQty = shopStock - taked;
                          if (sumQty > 0) {
                            const { data: res } = await api.put(`products/${item?.id}/variations/${product[0]?.id}`, { stock_quantity: sumQty });
                            if (res) {
                              console.log(
                                `[Info][Prepare][Has-Order] Update Product SKU: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']} to stock_quantity: ${sumQty}`,
                              );
                            }
                          } else {
                            const { data: res } = await api.put(`products/${item?.id}/variations/${product[0]?.id}`, {
                              stock_quantity: 0,
                              stock_status: 'outofstock',
                            });
                            if (res) {
                              console.log(
                                `[Info][Prepare][Has-Order] Update Product SKU: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']} to stock_quantity 0 and stock_status: 'outofstock'`,
                              );
                            }
                          }
                        } else {
                          if (shopStock > 0) {
                            const { data: res } = await api.put(`products/${item?.id}/variations/${product[0]?.id}`, { stock_quantity: shopStock });
                            if (res) {
                              console.log(
                                `[Info] Update Product SKU: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']} to stock_quantity: ${shopStock}`,
                              );
                            }
                          } else {
                            const { data: res } = await api.put(`products/${item?.id}/variations/${product[0]?.id}`, {
                              stock_quantity: 0,
                              stock_status: 'outofstock',
                            });
                            if (res) {
                              console.log(
                                `[Info] Update Product SKU: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']} to stock_quantity: 0 and stock_status: 'outofstock'`,
                              );
                            }
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                const shop22Stock = await this.service.getStockQtyByItemSaleGoodId(Number(item?.sku));
                if (shop22Stock.length > 0) {
                  const raw = (await redis.get(`order:done:${item?.id}`)) ?? '{}';
                  const orderTaked = JSON.parse(raw ?? '{}');
                  const shopStock = Number(shop22Stock?.[0]['ORD_POSS_QTY']) ?? 0;
                  const webStock = Number(item?.stock_quantity) ?? 0;
                  if (webStock > shopStock) {
                    if (orderTaked && orderTaked?.quantity) {
                      const taked = Number(orderTaked?.quantity);
                      const sumQty = shopStock - taked;
                      if (sumQty > 0) {
                        const { data } = await api.put(`products/${item?.id}`, { stock_quantity: sumQty });
                        if (data) {
                          console.log(`[Info][Prepare][Has-Order] Update Product SKU: ${item?.sku} to stock_quantity: ${sumQty}`);
                        }
                      } else {
                        const { data } = await api.put(`products/${item?.id}`, { stock_quantity: 0, stock_status: 'outofstock' });
                        if (data) {
                          console.log(
                            `[Info][Prepare][Has-Order] Update Product SKU: ${item?.sku} to stock_quantity 0 and stock_status: 'outofstock'`,
                          );
                        }
                      }
                    } else {
                      if (shopStock > 0) {
                        const { data } = await api.put(`products/${item?.id}`, { stock_quantity: shopStock });
                        if (data) {
                          console.log(`[Info] Update Product SKU: ${item?.sku} to stock_quantity: ${shopStock}`);
                        }
                      } else {
                        const { data } = await api.put(`products/${item?.id}`, { stock_quantity: 0, stock_status: 'outofstock' });
                        if (data) {
                          console.log(`[Info] Update Product SKU: ${item?.sku} to stock_quantity: 0 and stock_status: 'outofstock'`);
                        }
                      }
                    }
                  }
                }
              }
              redis.set(`cronjob:updatestock:prepare:${item?.sku}`, 'w', { EX: 120 * 60 });
            } else {
              console.log(`[WARNING] Product SKU: ${item?.sku} is not correct`);
            }
          }
        }
      }
      this.updateStockPrepareRunning = false;
      console.log('[Info] Update Stock Prepare Done');
    } catch (error) {
      this.updateStockPrepareRunning = false;
      console.error(error);
      // restart job
      this.updateStockModePrepare(redis);
    }
  };

  private updateStockModeReset = async (redis: RedisClientType) => {
    try {
      console.log('[Info] Start Update Stock Mode Reset');
      if (this.updateStockModeResetRunning) {
        console.log('[Info] Update Stock is running');
        return;
      }

      this.updateStockModeResetRunning = true;
      for (let i = 1; i < 3000; i++) {
        let data = [];
        const rawProducts = await redis.get(`product:page:slug:${i}`);
        if (!rawProducts) {
          const { data: webProducts } = await api.get(`products?page=${i}&per_page=10`);
          data = webProducts;
          redis.set(`product:page:slug:${i}`, JSON.stringify(webProducts));
        } else {
          data = JSON.parse(rawProducts);
        }
        for (const item of data) {
          await this.sleep(100);
          const hasWatch = await redis.get(`cronjob:updatestock:reset:${item?.sku}`);
          if (!hasWatch) {
            console.log('[Info] Watch New Job Stock for product SKU: ', item?.sku);
            if (item?.sku?.length === 6) {
              if (item?.variations?.length > 0) {
                const shop22Stock = await this.service.getStockQtyByItemSaleGoodId(Number(item?.sku));
                if (shop22Stock.length > 0) {
                  for (const subItem of shop22Stock) {
                    console.log(`[Info] Watch a sub item sku: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']}`);
                    let product = [];
                    const rawProduct = await redis.get(`product:sku:${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']}`);
                    if (!rawProduct) {
                      const { data: webProduct } = await api.get(`products?sku=${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']}`);
                      product = webProduct;
                      redis.set(`product:sku:${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']}`, JSON.stringify(product));
                    } else {
                      product = JSON.parse(rawProduct);
                    }
                    if (product[0]?.id) {
                      const raw = (await redis.get(`order:done:${data[0]?.id}`)) ?? '{}';
                      const orderTaked = JSON.parse(raw ?? '{}');
                      const shopStock = Number(subItem['ORD_POSS_QTY']) ?? 0;
                      const webStock = Number(product[0]?.stock_quantity) ?? 0;
                      if (orderTaked && orderTaked?.quantity) {
                        const taked = Number(orderTaked?.quantity);
                        const sumQty = shopStock - taked;
                        if (sumQty > 0) {
                          const { data: res } = await api.put(`products/${item?.id}/variations/${product[0]?.id}`, { stock_quantity: sumQty });
                          if (res) {
                            console.log(
                              `[Info][Prepare][Has-Order] Update Product SKU: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']} to stock_quantity: ${sumQty}`,
                            );
                          }
                        } else {
                          const { data: res } = await api.put(`products/${item?.id}/variations/${product[0]?.id}`, {
                            stock_quantity: 0,
                            stock_status: 'outofstock',
                          });
                          if (res) {
                            console.log(
                              `[Info][Prepare][Has-Order] Update Product SKU: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']} to stock_quantity 0 and stock_status: 'outofstock'`,
                            );
                          }
                        }
                      } else {
                        if (shopStock > 0) {
                          const { data: res } = await api.put(`products/${item?.id}/variations/${product[0]?.id}`, { stock_quantity: shopStock });
                          if (res) {
                            console.log(
                              `[Info] Update Product SKU: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']} to stock_quantity: ${shopStock}`,
                            );
                          }
                        } else {
                          const { data: res } = await api.put(`products/${item?.id}/variations/${product[0]?.id}`, {
                            stock_quantity: 0,
                            stock_status: 'outofstock',
                          });
                          if (res) {
                            console.log(
                              `[Info] Update Product SKU: ${subItem['SALE_GOOD_ID']}-${subItem['SUB_SHOP']} to stock_quantity: 0 and stock_status: 'outofstock'`,
                            );
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                const shop22Stock = await this.service.getStockQtyByItemSaleGoodId(Number(item?.sku));
                if (shop22Stock.length > 0) {
                  const raw = (await redis.get(`order:done:${item?.id}`)) ?? '{}';
                  const orderTaked = JSON.parse(raw ?? '{}');
                  const shopStock = Number(shop22Stock?.[0]['ORD_POSS_QTY']) ?? 0;
                  const webStock = Number(item?.stock_quantity) ?? 0;

                  if (orderTaked && orderTaked?.quantity) {
                    const taked = Number(orderTaked?.quantity);
                    const sumQty = shopStock - taked;
                    if (sumQty > 0) {
                      const { data } = await api.put(`products/${item?.id}`, { stock_quantity: sumQty });
                      if (data) {
                        console.log(`[Info][Prepare][Has-Order] Update Product SKU: ${item?.sku} to stock_quantity: ${sumQty}`);
                      }
                    } else {
                      const { data } = await api.put(`products/${item?.id}`, { stock_quantity: 0, stock_status: 'outofstock' });
                      if (data) {
                        console.log(`[Info][Prepare][Has-Order] Update Product SKU: ${item?.sku} to stock_quantity 0 and stock_status: 'outofstock'`);
                      }
                    }
                  } else {
                    if (shopStock > 0) {
                      const { data } = await api.put(`products/${item?.id}`, { stock_quantity: shopStock });
                      if (data) {
                        console.log(`[Info] Update Product SKU: ${item?.sku} to stock_quantity: ${shopStock}`);
                      }
                    } else {
                      const { data } = await api.put(`products/${item?.id}`, { stock_quantity: 0, stock_status: 'outofstock' });
                      if (data) {
                        console.log(`[Info] Update Product SKU: ${item?.sku} to stock_quantity: 0 and stock_status: 'outofstock'`);
                      }
                    }
                  }
                }
              }
              redis.set(`cronjob:updatestock:reset:${item?.sku}`, 'w', { EX: 12 * 60 * 60 });
            } else {
              console.log(`[WARNING] Product SKU: ${item?.sku} is not correct`);
            }
          }
        }
      }
      this.updateStockModeResetRunning = false;
      console.log('[Info] Update Stock Prepare Done');
    } catch (error) {
      this.updateStockModeResetRunning = false;
      console.error(error);

      // restart job
      this.updateStockModeReset(redis);
    }
  };
}

export default ProductConjob;
