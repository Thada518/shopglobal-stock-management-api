import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import WebhookController from '@controllers/webhook.controller';

class WebhookRoute implements Routes {
  public path = '/webhooks';
  public router = Router();
  public controller = new WebhookController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/created-order`, this.controller.setOrderTempData);
  }
}

export default WebhookRoute;
