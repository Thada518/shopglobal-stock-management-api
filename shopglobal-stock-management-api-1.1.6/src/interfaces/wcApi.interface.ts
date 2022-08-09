export interface coupon {
  id: number;
  code: string;
  amount: string;
  date_created?: string; // Date but I do not know will it be string or Date.
  date_modified?: string; // Date but I do not know will it be string or Date.
  discount_type?: string;
  description?: string;
  date_expires?: string;
  usage_count?: number;
  individual_use?: boolean;
  product_ids?: number[]; //not sure about this. source said array
  excluded_product_ids?: number[]; //not sure about this. source said array
  usage_limit?: number;
  usage_limit_per_user?: number;
  limit_usage_to_x_items?: number;
  free_shipping?: boolean;
  product_categories?: number[]; //not sure about this. source said array
  excluded_product_categories?: number[]; //not sure about this. source said array
  exclude_sale_items?: boolean;
  minimum_amount?: string;
  maximum_amount?: string;
  email_restrictions?: any[]; //not sure about this. source said array
  used_by?: string[]; //not sure about this. source said array
  meta_data?: any[]; //not sure about this. source said array
}

export interface product {
  id: number;
  name: string;
  slug?: string;
  permalink?: string;
  date_created?: string; // Date but I do not know will it be string or Date.
  date_modified?: string; // Date but I do not know will it be string or Date.
  type?: string;
  status: string;
  featured?: boolean;
  catalog_visibility?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  date_on_sale_from?: string; // Date but I do not know will it be string or Date.
  date_on_sale_to?: string; // Date but I do not know will it be string or Date.
  price_html?: string;
  on_sale?: boolean;
  purchasable?: boolean;
  total_sales?: number;
  virtual?: boolean;
  downloadable?: boolean;
  downloads?: any[]; //not sure about this. source said array
  download_limit?: number;
  download_expiry?: number;
  external_url?: string;
  button_text?: string;
  tax_status?: string;
  tax_class?: string;
  manage_stock?: boolean;
  stock_quantity?: number;
  stock_status?: string;
  backorders?: string;
  backorders_allowed?: boolean;
  backordered?: boolean;
  sold_individually?: boolean;
  weight?: string;
  dimensions?: any; // souce said object
  shipping_required?: boolean;
  shipping_taxable?: boolean;
  shipping_class?: string;
  shipping_class_id?: number;
  reviews_allowed?: boolean;
  average_rating?: string;
  rating_count?: number;
  related_ids?: number[]; //not sure about this. source said array
  upsell_ids?: number[]; //not sure about this. source said array
  cross_sell_ids?: number[]; //not sure about this. source said array
  parent_id?: number;
  purchase_note?: string;
  categories?: any[]; //not sure about this. source said array
  tags?: any[]; //not sure about this. source said array
  images?: any[]; //not sure about this. source said array
  attributes?: any[]; //not sure about this. source said array
  default_attributes?: any[]; //not sure about this. source said array
  variations?: any[]; //not sure about this. source said array
  grouped_products?: any[]; //not sure about this. source said array
  menu_order?: number;
  meta_data?: any[]; //not sure about this. source said array
}

export interface ICreateProduct {
  name: string;
  type?: string;
  regular_price: string;
  description?: string;
  short_description?: string;
  categories?: { id: number }[];
  images?: { src: string }[];
}
