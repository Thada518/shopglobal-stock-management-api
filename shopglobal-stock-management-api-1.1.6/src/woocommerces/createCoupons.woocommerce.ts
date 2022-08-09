import { coupon } from '@interfaces/wcApi.interface';
import { wooApi as api } from '@/woocommerces/wooCommerceApi.woocommerce';

const couponData: coupon = {
  id: 1,
  code: '10off',
  discount_type: 'percent',
  amount: '10',
  individual_use: true,
  exclude_sale_items: true,
  minimum_amount: '100.00',
};

const createCoupons = () => {
  api
    .post(`coupons`, couponData)
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

export default createCoupons;
