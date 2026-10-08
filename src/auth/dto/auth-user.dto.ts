import { IsEmail, IsString } from "class-validator";

export class AuthUserDto {
    @IsString()
    name:string;
    @IsEmail()
    email:string;

    @IsString()
    passwordHash:string;
}
