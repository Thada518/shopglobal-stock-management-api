import { IsString, IsNumber } from 'class-validator';

export class CreateProduct {
  @IsString()
  public name: string;

  @IsString()
  public type: string;

  @IsString()
  public price: string;

  @IsString()
  public regular_price: string;

  @IsString()
  public description: string;

  @IsString()
  public short_description: string;

  @IsString()
  public sku: string;

  public categories: { id: number }[];

  public images: { src: string }[];
}

export class UpdateProduct {
  @IsNumber()
  public id: number;

  @IsString()
  public name: string;

  public slug: string;

  public permalink: string;

  public status: string;

  public type: string;

  public date_created: string;

  public date_modified: string;

  public featured: boolean;

  public catalog_visibility: string;

  public description: string;

  public short_description: string;

  public sku: string;

  public price: string;

  public regular_price: string;

  public sale_price: string;

  public stock_quantity: number;

  public stock_status: string;

  public categories: { id: number }[];

  public images: { src: string }[];
}
