import { product } from '@interfaces/wcApi.interface';
import { wooApi } from '@/woocommerces/wooCommerceApi.woocommerce';

const api = wooApi;
const product_id = 1;
const product_data: product = {
  sale_price: '',
  id: 0,
  name: '',
  status: '',
};

const updateProduct = () => {
  api
    .put(`products/${product_id}`, product_data)
    .then((response: { status: any; headers: any; data: any }) => {
      // Successful request
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Response Data:', response.data);
    })
    .catch((error: { response: { status: any; headers: any; data: any } }) => {
      // Invalid request, for 4xx and 5xx statuses
      console.log('Response Status:', error.response.status);
      console.log('Response Headers:', error.response.headers);
      console.log('Response Data:', error.response.data);
    })
    .finally(() => {
      // Always executed.
    });
};

export default updateProduct;
