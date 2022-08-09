import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import ShopController from '@controllers/shop.controller';

class ShopRoute implements Routes {
  public path = '/shop';
  public router = Router();
  public shop = new ShopController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get(`${this.path}/get-products`);
    // this.router.get(`${this.path}/get-product/:id(\\d+)`);
    // this.router.get(`${this.path}/get-coupons`);
    // this.router.get(`${this.path}/get-coupon/:id(\\d+)`);
    // this.router.post(`${this.path}/create-order`);

    this.router.get(`${this.path}/salegood-id-by-date/:date/:weekly(\\d+)`, this.shop.getSaleGoodIdsByDate);
    this.router.get(`${this.path}/salesku-id-by-salegood-id/:saleGoodId(\\d+)`, this.shop.getSaleSkuIdBySaleGoodId);
    this.router.get(`${this.path}/product-details-by-salegood-id/:saleGoodId(\\d+)`, this.shop.getProductDetailBySaleGoodId);
    this.router.get(`${this.path}/product-warehoure/:saleGoodId/:styleId/:colorId`, this.shop.getWarehouseLocationBySaleGoodStyleAndColor);
    this.router.get(`${this.path}/product-stock-by-salegood-id/:saleGoodId`, this.shop.getStockQtyByItemSaleGoodId);
    this.router.get(`${this.path}/promotion-by-event-id/:eventId`, this.shop.getPromotionDetailsByEventId);
    this.router.get(`${this.path}/discount-price-by-salegood-id/:saleGoodId`, this.shop.getDiscountPriceBySaleGoodId);
  }
}

export default ShopRoute;
