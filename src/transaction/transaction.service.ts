import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TransactionService {
  constructor(private prismaService:PrismaService, private categoryService:CategoriesService){}

  async create(createTransactionDto: CreateTransactionDto) {
    // const transaction = await this.prismaService.transaction.create
    //cek kategori
    await this.categoryService.findOne(createTransactionDto.categoryId);

    const transaction = await this.prismaService.transaction.create({
      data:createTransactionDto,
    });
    return transaction;
  }

 async findAll() {
  const transactions = await this.prismaService.transaction.findMany({
   include:{
    user:{
      select:{
        id:true,
        name:true,
      },
    },
    category:{
      select:{
        id:true,
        name:true,
      },
    },
    
   },
  })
    return transactions;
  }

  async findOne(id: string) {
    const transaction = await this.prismaService.transaction.findUnique({
      where:{
        id:id,
      },
    });
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(id);

    const updatedTransaction = await this.prismaService.transaction.update({
      where:{
        id:id,
      },
      data:updateTransactionDto,
    });
    return updatedTransaction;
  }

  async remove(id: string) {
    await this.findOne(id);

    const deleteTransaction = await this.prismaService.transaction.delete({
      where:{
        id:id,
      },
    });
    return deleteTransaction;
  }
}
