import { IsDate, IsDecimal, IsOptional, IsString } from "class-validator";

export class CreateTransactionDto {
    @IsString()
    userId: string;
    @IsString()
    categoryId: string;
    @IsDecimal()
    amount: number;
    @IsString()
    type:string;
    @IsString()
    @IsOptional()
    description:string;
    @IsDate()
    transactionDate:Date;

}
