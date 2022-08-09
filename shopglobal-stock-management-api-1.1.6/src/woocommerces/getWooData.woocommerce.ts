import { wooApi } from '@/woocommerces/wooCommerceApi.woocommerce';

const api = wooApi;

const getWooData = (goodsData: string) => {
  api
    .get(goodsData)
    .then((response: { data: any }) => {
      console.log(response.data);
    })
    .catch((error: { response: { data: any } }) => {
      console.log(error.response.data);
    });
};

export default getWooData;
