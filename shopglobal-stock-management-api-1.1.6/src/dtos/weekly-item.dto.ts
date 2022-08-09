import { IsString, IsNumber } from 'class-validator';

export class GetSaleGoodIdsByDate {
  @IsString()
  public date: string;

  @IsNumber()
  public weekly: number;
}
