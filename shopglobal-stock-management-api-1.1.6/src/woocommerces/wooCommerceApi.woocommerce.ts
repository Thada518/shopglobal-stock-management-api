import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { WC_URL, WC_KEY, WC_SECRET } from '@config';

export const wooApi = new WooCommerceRestApi({
  url: WC_URL || 'https://test.shopch.in.th',
  consumerKey: WC_KEY || 'ck_e410ee8ef62ec5ae843ba84bb661e5da66cd6db7',
  consumerSecret: WC_SECRET || 'cs_9e266693442e7a801fe94b8dc2b7346661b5a3e6',
  version: 'wc/v3',
  // queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
});
