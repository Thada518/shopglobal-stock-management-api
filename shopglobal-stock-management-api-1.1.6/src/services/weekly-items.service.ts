import OracleDB from 'oracledb';
import { RedisClientType } from 'redis';
import WeeklyItemsModel from '@models/weekly-items.model';
import Redis from '@connections/redis.connection';
import { init as oraclePool } from '@connections/oracle.connection';

class WeeklyItemsService {
  public oracleClient: OracleDB.Connection;
  private weeklyItemsModel: WeeklyItemsModel;
  public redis: RedisClientType;

  constructor() {
    this.initDatabaseAndModel();
  }

  private initDatabaseAndModel = async () => {
    try {
      this.oracleClient = await oraclePool();
      this.weeklyItemsModel = new WeeklyItemsModel(this.oracleClient);
    } catch (error) {
      console.error(error);
    }
  };

  public getSaleGoodIdsByDate = async (date: string, weeklyNumber: number): Promise<any[]> => {
    const result = await this.weeklyItemsModel.getSaleGoodIdsByDate(date, weeklyNumber);
    return result?.rows ?? null;
  };
  public getSSVProductByDate = async (date: string, weeklyNumber: number): Promise<any[]> => {
    const result = await this.weeklyItemsModel.getSSVProductByDate(date, weeklyNumber);
    return result?.rows ?? null;
  };

  public getSaleSkuIdBySaleGoodId = async (saleGoodId: number): Promise<any[]> => {
    const result = await this.weeklyItemsModel.getSaleSkuIdBySaleGoodId(saleGoodId);
    return result?.rows ?? null;
  };

  public getProductDetailBySaleGoodId = async (saleGoodId: number): Promise<any[]> => {
    try {
      const data = await this.weeklyItemsModel.getProductDetailBySaleGoodId(saleGoodId);
      const product = data?.rows?.map(row => {
        const parserProductName = (raw: string) => {
          const nameSplit = String(raw?.split('\r\n\r\n')?.[0]) ?? '';
          if (nameSplit !== '' && nameSplit.includes('\r\n')) {
            return nameSplit.replace('\r\n', ' ');
          } else {
            return nameSplit;
          }
        };

        const parserProductNameDescription = (raw: string) => {
          if (raw?.includes('\r\n\r\n')) {
            return raw?.replace('\r\n\r\n', ' ');
          } else if (raw?.includes('\r\n')) {
            return raw.replace('\r\n', ' ');
          } else {
            return raw;
          }
        };

        const parseProductProperry = (raw: string) => {
          let res = '';
          raw?.split('*').forEach(s => {
            res = res + s.trimEnd();
          });
          return res;
        };

        const parseCgInfo = (raw: string) => {
          let details = '';

          raw?.split('\r\n\r\n').forEach(s => {
            details = details + s.trimEnd() + ' ';
          });

          if (details !== '' && details?.includes('\r\n')) {
            return details.replace('\r\n', ' ');
          } else {
            return details;
          }
        };

        return {
          SALE_GOOD_ID: row.SALE_GOOD_ID,
          NAME: parserProductName(row?.CG_SEND_INFO3),
          DESCRIPTION: parserProductNameDescription(row?.USAGE_DESC),
          PROPERTY: parseProductProperry(row?.PROPERTY_DESC),
          CG_TV_INFO: parseCgInfo(row?.CG_SEND_INFO3),
          BRAND: row.CG_SEND_INFO4,
        };
      });

      const { rows } = (await this.weeklyItemsModel.getSaleSkuIdBySaleGoodId(saleGoodId)) || {};
      const productOptions = rows?.map(row => {
        return {
          ...row,
          SALE_SKU_ID: row.SALE_SKU_ID.toString().substr(0, 6) + '-' + row.SALE_SKU_ID.toString().substr(6, 3),
          SALE_COLOR_ID: row.SALE_COLOR_ID,
          SELL_COLOR_DESC: row.SELL_COLOR_DESC,
          SALE_STYLE_ID: row.SALE_STYLE_ID,
          SELL_STYLE_DESC: row.SELL_STYLE_DESC,
          SALE_YN: row.SALE_YN === 'Y' ? true : false,
        };
      });
      const categories = await this.weeklyItemsModel.getCategoryDetailBySalesGoodId(saleGoodId);
      return (
        [
          {
            ...product[0],
            SALE_GOOD_APPR_CD: categories?.lastApprove,
            OPTIONS: productOptions,
            CATEGORY: categories?.row?.map(row => row.CLSS_NM),
          },
        ] ?? null
      );
    } catch (error) {
      console.error(error);
    }
  };

  public getWarehouseLocationBySaleGoodStyleAndColor = async (saleGoodId: number, styleId: number, colorId: number) => {
    try {
      const data = await this.weeklyItemsModel.getWarehouseLocationBySaleGoodStyleAndColor(saleGoodId, styleId, colorId);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  public getStockQtyByItemSaleGoodId = async (saleGoodId: number, subId = '') => {
    try {
      const data = await this.weeklyItemsModel.getStockQtyByItemSaleGoodId(saleGoodId);
      if (subId !== '' && subId !== 'undefined') {
        return data.filter(r => r['SUB_SHOP'] === subId);
      }
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  public getDiscountPriceBySaleGoodId = async (saleGoodId: number) => {
    try {
      const data = await this.weeklyItemsModel.getDiscountPriceBySaleGoodId(saleGoodId);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  public getPromotionDetailsByEventId = async (eventId: number) => {
    try {
      const data = await this.weeklyItemsModel.getPromotionDetailsByEventId(eventId);
      return data;
    } catch (error) {
      console.error(error);
    }
  };
}

export default WeeklyItemsService;
