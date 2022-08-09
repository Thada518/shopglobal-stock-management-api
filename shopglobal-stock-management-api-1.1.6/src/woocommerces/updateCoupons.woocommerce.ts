import { coupon } from '@interfaces/wcApi.interface';
import { wooApi } from '@/woocommerces/wooCommerceApi.woocommerce';

const api = wooApi;
const coupons_id = 1;
const coupons_data: coupon = {
  id: 0,
  code: '',
  amount: '',
  date_created: '',
  date_modified: '',
  usage_count: 0,
};

const updateCoupons = () => {
  api
    .put(`coupons/${coupons_id}`, coupons_data)
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

export default updateCoupons;
