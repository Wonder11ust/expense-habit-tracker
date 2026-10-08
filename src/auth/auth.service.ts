import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUserDto } from './dto/auth-user.dto';
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService, private readonly userService: UsersService, private readonly jwtService:JwtService) { }

     async signUp(dto: AuthUserDto) {
        const hashedPassword = await bcrypt.hash(dto.passwordHash, 10);
        console.log('hashedPass:',hashedPassword);
        const user = await this.prismaService.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash: hashedPassword
            },
        });
        return user;
    }

     async login(email: string, password: string) {
        const user = await this.userService.findUserByEmail(email);

        const checkPassword = await bcrypt.compare(password,user.passwordHash);
        if(!checkPassword){
            throw new UnauthorizedException('Invalid Credentials');
        }

        const payload = {
            sub: user.id,
            email:user.email,
        }

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
            },
        };
    }


}
