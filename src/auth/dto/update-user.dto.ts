import { PartialType } from '@nestjs/mapped-types';
import { AuthUserDto } from './auth-user.dto';

export class UpdateUserDto extends PartialType(AuthUserDto) {}
