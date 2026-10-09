import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Controller('transaction')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.transactionService.create(createTransactionDto, userId);
  }

  @Get()
  findAll(
    @Query() query: QueryTransactionDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.transactionService.findAll(userId, query);
  }

  @Get('monthly-summary')
  monthlySummary(
    @Query('month') month: string,
    @Query('year') year: string,
    @CurrentUser('userId') userId: string
  ) {
    return this.transactionService.monthlySummary(Number(month), Number(year),userId);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
