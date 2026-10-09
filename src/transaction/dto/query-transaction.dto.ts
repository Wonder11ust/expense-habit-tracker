import { Type } from "class-transformer";
import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from "class-validator";

export class QueryTransactionDto{
    @IsOptional()
    @IsIn(["income","expense"])
    type?: string;

    @IsOptional()
    @IsString()
    categoryId?:string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minAmount?:number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxAmount?:number;

    @IsOptional()
    @IsDateString()              // validasi format ISO date (yyyy-mm-dd)
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}