import { Transform } from "class-transformer";
import { IsDate, IsDecimal, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTransactionDto {
    @IsString()
    categoryId: string;

    @IsNumber()
    amount: number;

    @IsString()
    type:string;

    @IsString()
    @IsOptional()
    description:string;

    @Transform(({value}) => new Date(value))
    @IsDate()
    transactionDate:Date;

}
