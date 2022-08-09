import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import WoocommerceRoute from '@routes/woocommerce.route';
import ShopRoute from '@routes/shop.route';
import WebhookRoute from '@routes/webhook.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new WoocommerceRoute(), new ShopRoute(), new WebhookRoute()]);

app.listen();
