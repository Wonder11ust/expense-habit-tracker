import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import *  as bcrypt from 'bcrypt';
import { error } from 'console';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) { }
  async create(createUserDto: CreateUserDto) {
    const password = await bcrypt.hash(createUserDto.passwordHash,10)
    const user = await this.prismaService.user.create({
      data:{
        name:createUserDto.name,
        email:createUserDto.email,
        passwordHash:password,
      }
    });
    return user;
  }


  async findAll() {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    return users.map(u => {
      const entity = new User()
      entity.id = u.id;
      entity.name = u.name;
      entity.email = u.email;
      return entity
    });
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: id
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });
    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }
    return user;
  }

async findUserByEmail(email:string){
  const user = await this.prismaService.user.findUniqueOrThrow({
    where:{
      email:email
    },
  });
  if(!user){
    throw new NotFoundException(`user with email ${email} not found`);
  }
  return user;
}

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: id,
      }
    });

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    const updateUser = await this.prismaService.user.update({
      where: {
        id: id,
      },
      data: updateUserDto
    });
    return updateUser;
  }

  async remove(id: string) {

    const user = await this.prismaService.user.findFirst({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    const deletedUser = await this.prismaService.user.delete({
      where:{
        id: id,
      },
    });
    return deletedUser;
  }
}
