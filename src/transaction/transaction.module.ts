import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { CategoriesService } from '../categories/categories.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService,CategoriesService],
})
export class TransactionModule {}
