import { wooApi as api } from '@/woocommerces/wooCommerceApi.woocommerce';

const getProducts = (): Promise<{ response: { data }; error: any }> => api.get('products');

export default getProducts;
