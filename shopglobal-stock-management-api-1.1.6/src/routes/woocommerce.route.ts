import { Router } from 'express';
import WoocommerceController from '@controllers/woocommerce.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateProduct, UpdateProduct } from '@dtos/product.dto';
import { CreateCoupon, UpdateCoupon } from '@dtos/coupon.dto';
import { Routes } from '@interfaces/routes.interface';

class WoocommerceRoute implements Routes {
  public path = '/woocommerce';
  public router = Router();
  public woocommerceController = new WoocommerceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/get-products`, this.woocommerceController.getAllProducts);
    this.router.get(`${this.path}/get-product/:id`, this.woocommerceController.getProductById);
    this.router.get(`${this.path}/get-product-by-sku/:sku`, this.woocommerceController.getProductBySku);
    this.router.post(`${this.path}/create-product`, validationMiddleware(CreateProduct, 'body', true), this.woocommerceController.createProduct);
    this.router.put(`${this.path}/update-product/:id`, this.woocommerceController.updateProduct);
    this.router.post(`${this.path}/create-coupon`, validationMiddleware(CreateCoupon, 'body', true), this.woocommerceController.createCoupons);
    this.router.put(`${this.path}/update-coupon`, validationMiddleware(UpdateCoupon, 'body', true), this.woocommerceController.updateCoupons);
    this.router.delete(`${this.path}/delete-coupon/:id(\\d+)`, this.woocommerceController.deleteCoupons);
    this.router.get(`${this.path}/inqury-order/:id(\\d+)`, this.woocommerceController.getOrderById);
    this.router.get(`${this.path}/get-customers`, this.woocommerceController.getCustomners);
    this.router.get(`${this.path}/get-customer/:id(\\d+)`, this.woocommerceController.getCustomerById);
  }
}

export default WoocommerceRoute;
