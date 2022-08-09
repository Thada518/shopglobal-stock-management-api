import { NextFunction, Request, Response } from 'express';
import WeeklyItemsService from '@services/weekly-items.service';
import { Console } from 'winston/lib/winston/transports';

class ShopController {
  public weeklyItemsService = new WeeklyItemsService();

  // SSV Item Weekly
  public getSaleGoodIdsByDate = async (req: Request, res: Response): Promise<void> => {
    try {
      const date = req.params.date;
      const weekly = Number(req.params.weekly);
      const data = await this.weeklyItemsService.getSaleGoodIdsByDate(date, weekly);
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public getSaleSkuIdBySaleGoodId = async (req: Request, res: Response): Promise<void> => {
    try {
      const saleGoodId = Number(req.params.saleGoodId);
      const data = await this.weeklyItemsService.getSaleSkuIdBySaleGoodId(saleGoodId);
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {}
  };

  public getProductDetailBySaleGoodId = async (req: Request, res: Response): Promise<void> => {
    try {
      const saleGoodId = Number(req.params.saleGoodId);
      const data = await this.weeklyItemsService.getProductDetailBySaleGoodId(saleGoodId);
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };
  public getWarehouseLocationBySaleGoodStyleAndColor = async (req: Request, res: Response): Promise<void> => {
    try {
      const saleGoodId = Number(req.params.saleGoodId);
      const colorId = Number(req.params.colorId);
      const styleId = Number(req.params.styleId);
      const data = await this.weeklyItemsService.getWarehouseLocationBySaleGoodStyleAndColor(saleGoodId, styleId, colorId);
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public getStockQtyByItemSaleGoodId = async (req: Request, res: Response): Promise<void> => {
    try {
      const saleGoodId = Number(req.params.saleGoodId);
      const subId = String(req.query.subId) ?? '-';
      const data = await this.weeklyItemsService.getStockQtyByItemSaleGoodId(saleGoodId, subId);
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public getDiscountPriceBySaleGoodId = async (req: Request, res: Response): Promise<void> => {
    try {
      const saleGoodId = Number(req.params.saleGoodId);
      const data = await this.weeklyItemsService.getDiscountPriceBySaleGoodId(saleGoodId);
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public getPromotionDetailsByEventId = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = Number(req.params.eventId);
      const data = await this.weeklyItemsService.getPromotionDetailsByEventId(eventId);
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };
}

export default ShopController;
