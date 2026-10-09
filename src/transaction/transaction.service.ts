import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class TransactionService {
  constructor(private prismaService: PrismaService, private categoryService: CategoriesService) { }

  async create(createTransactionDto: CreateTransactionDto, userId: string) {

    await this.categoryService.findOne(createTransactionDto.categoryId);

    const transaction = await this.prismaService.transaction.create({
      data: {
        ...createTransactionDto,
        userId,
      },
    });
    return transaction;
  }

  async findAll(
    userId: string,
    query?: QueryTransactionDto,
  ) {
    const where: Prisma.TransactionWhereInput = {
      userId,
    }

    if (query?.type) {
      where.type = query.type;
    }

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.minAmount || query?.maxAmount) {
      where.amount = {};
      if (query.minAmount) where.amount.gte = query.minAmount
      if (query.maxAmount) where.amount.lte = query.maxAmount
    }

    if (query?.startDate || query?.endDate) {
      where.transactionDate = {}
      if (query.startDate) where.transactionDate.gte = new Date(query.startDate)
      if (query.endDate) where.transactionDate.lte = new Date(query.endDate)
    }
    const transactions = await this.prismaService.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },

      },
    })
    return transactions;
  }

  async findOne(id: string) {
    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id: id,
      },
    });
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(id);

    const updatedTransaction = await this.prismaService.transaction.update({
      where: {
        id: id,
      },
      data: updateTransactionDto,
    });
    return updatedTransaction;
  }

  async remove(id: string) {
    await this.findOne(id);

    const deleteTransaction = await this.prismaService.transaction.delete({
      where: {
        id: id,
      },
    });
    return deleteTransaction;
  }

  async monthlySummary(
    month: number,
    year: number,
    userId: string,
  ) {

    const summaryTransactions = await this.prismaService.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          lte: new Date(year, month, 0, 23, 59, 59, 999),
          gte: new Date(year, month - 1, 1)
        },
      },
      include: {
        category: true,
      }
    });

    const lastMonthSummaryTransactions = await this.prismaService.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        transactionDate: {
          lte: new Date(year, month - 1, 0, 23, 59, 59, 999),
          gte: new Date(year, month - 2, 1)
        },
      },
      _sum: {
        amount: true,
      },
    });
    const expenseByCategory: Array<{
      categoryName: string;
      total: number;
      percentage: number
    }> = []

    const totals = summaryTransactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += Number(transaction.amount)
      } else {
        acc.expense += Number(transaction.amount)
      }
      return acc;
    },
      { income: 0, expense: 0 });

    const balance = totals.income - totals.expense;
    const totalExpenseLastMonth = Number(lastMonthSummaryTransactions._sum.amount ?? 0);

    for (const st of summaryTransactions) {
      if (st.type == 'expense') {
        expenseByCategory.push({
          categoryName: st.category.name,
          total: Number(st.amount),
          percentage: totals.expense > 0 ? Number(Number((Number(st.amount) / totals.expense) * 100).toFixed(2)) : 0
        });
      }
    }
    return {
      totalIncome: totals.income,
      totalExpense: totals.expense,
      balance: balance,
      expenseByCategory,
      totalExpenseLastMonth: totalExpenseLastMonth

    };
  }

  // ============================================================
  // VERSI PERBAIKAN — bandingkan dengan monthlySummary di atas
  // ============================================================
  async monthlySummaryFixed(
    month: number,
    year: number,
    userId: string,
  ) {
    // ---- 1. Ambil semua transaksi bulan ini ----
    const summaryTransactions = await this.prismaService.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59, 999),
        },
      },
      include: {
        category: true,
      },
    });

    // ---- 2. Hitung total income & expense (reduce) ----
    const totals = summaryTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += Number(transaction.amount);
        } else {
          acc.expense += Number(transaction.amount);
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );

    // ---- 3. Balance ----
    const balance = totals.income - totals.expense;

    // ---- 4. Group expense by category (akumulasi, bukan push mentah) ----
    const categoryTotals: Record<string, number> = {};
    for (const st of summaryTransactions) {
      if (st.type === 'expense') {
        const name = st.category.name;
        categoryTotals[name] = (categoryTotals[name] || 0) + Number(st.amount);
      }
    }

    // ---- 5. Convert ke format output + hitung percentage ----
    const expenseByCategory = Object.entries(categoryTotals).map(
      ([categoryName, total]) => ({
        categoryName,
        total,
        percentage: totals.expense > 0
          ? Number(((total / totals.expense) * 100).toFixed(2))
          : 0,
      }),
    );

    // ---- 6. Hitung bulan lalu (hanya expense) ----
    //    month=1 (Januari) → bulan lalu = Desember tahun sebelumnya
    const lastMonth = month === 1 ? 12 : month - 1;
    const lastMonthYear = month === 1 ? year - 1 : year;

    const lastMonthExpense = await this.prismaService.transaction.aggregate({
      where: {
        userId,
        type: 'expense', // ← HARUS filter expense saja!
        transactionDate: {
          gte: new Date(lastMonthYear, lastMonth - 1, 1),
          lte: new Date(lastMonthYear, lastMonth, 0, 23, 59, 59, 999),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalExpenseLastMonth = Number(lastMonthExpense._sum.amount ?? 0);

    // ---- 7. Hitung percentageChange + handle division by zero ----
    const percentageChange =
      totalExpenseLastMonth > 0
        ? Number(
          (
            ((totals.expense - totalExpenseLastMonth) / totalExpenseLastMonth) *
            100
          ).toFixed(2),
        )
        : null; // ← bulan lalu tidak ada data → null, bukan Infinity

    // ---- 8. Assemble response ----
    return {
      totalIncome: totals.income,
      totalExpense: totals.expense,
      balance,
      expenseByCategory,
      comparedToLastMonth: {
        totalExpenseLastMonth,
        percentageChange,
      },
    };
  }
}
