import { IsString, IsNumber } from 'class-validator';

export class CreateCoupon {
  @IsString()
  public code: string;

  @IsString()
  public discount_type: string;

  @IsString()
  public amount: string;

  public individual_use: boolean;

  public exclude_sale_items: boolean;

  public minimum_amount: string;

  public maximum_amount: string;

  @IsNumber()
  public usage_limit: number;

  public usage_limit_per_user: number;
}

export class UpdateCoupon {
  @IsNumber()
  public id: number;

  @IsString()
  public code: string;

  @IsString()
  public discount_type: string;

  @IsString()
  public amount: string;

  public individual_use: boolean;

  public exclude_sale_items: boolean;

  public minimum_amount: string;

  public maximum_amount: string;

  @IsNumber()
  public usage_limit: number;

  public usage_limit_per_user: number;
}
