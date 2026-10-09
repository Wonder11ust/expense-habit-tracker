import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { CategoriesService } from '../categories/categories.service';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports:[AuthModule,CategoriesModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
