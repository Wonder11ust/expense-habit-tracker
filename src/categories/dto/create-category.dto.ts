import { IsEnum, IsIn, IsOptional, IsString } from "class-validator"


export class CreateCategoryDto {
    @IsString()
    name:string;
    @IsIn(["income","expense"])
    type:string;
    @IsOptional()
    @IsString()
    icon?:string;
    @IsString()
    userId:string
}
