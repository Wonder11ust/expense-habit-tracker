import { Body, Controller, Post } from '@nestjs/common';
import { AuthUserDto } from './dto/auth-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private  readonly authService:AuthService){}
      @Post('sign-up')
      signUp(@Body() dto: AuthUserDto) {
        return  this.authService.signUp(dto)
      }

      @Post('login')
      login(@Body() dto:LoginDto){
        return this.authService.login(dto.email,dto.passwordHash)
      }
}
