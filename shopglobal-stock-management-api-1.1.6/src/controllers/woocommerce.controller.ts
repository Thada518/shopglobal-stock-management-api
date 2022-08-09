import { NextFunction, Request, Response } from 'express';
import { wooApi as api } from '@/woocommerces/wooCommerceApi.woocommerce';
import { CreateProduct, UpdateProduct } from '@dtos/product.dto';
import { CreateCoupon, UpdateCoupon } from '@dtos/coupon.dto';

class WoocommerceController {
  public getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { data } = await api.get('products');
      res.status(200).json({ error: 0, message: 'get products success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { data } = await api.get(`products/${id}`);
      res.status(200).json({ error: 0, message: 'get product success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public getProductBySku = async (req: Request, res: Response): Promise<void> => {
    try {
      const sku = req.params.sku;
      const { data } = await api.get(`products?sku=${sku}`);
      res.status(200).json({ error: 0, message: 'get product success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };
  public createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product: CreateProduct = req.body;
      const { data } = await api.post('products', product);
      res.status(200).json({ error: 0, message: 'created', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = req.body;
      const id = Number(req.params.id);
      const { data } = await api.put(`products/${id}`, product);
      res.status(200).json({ error: 0, message: 'updated', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public createCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
      const coupon: CreateCoupon = req.body;
      const { data } = await api.post('coupons', coupon);
      res.status(200).json({ error: 0, message: 'updated', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public updateCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
      const coupon: UpdateCoupon = req.body;
      const { data } = await api.put(`coupons/${coupon.id}`, coupon);
      res.status(200).json({ error: 0, message: 'updated', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public deleteCoupons = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { data } = await api.delete(`coupons/${id}`);
      res.status(200).json({ error: 0, message: 'deleted', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { data } = await api.get(`orders/${id}`);
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public getCustomners = async (req: Request, res: Response): Promise<void> => {
    try {
      const { data } = await api.get('customers');
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };

  public getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { data } = await api.get(`customers/${id}`);
      res.status(200).json({ error: 0, message: 'success', data });
    } catch (error) {
      res.status(500).json({ error: 500, message: error.message });
    }
  };
}

export default WoocommerceController;
