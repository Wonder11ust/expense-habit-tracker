import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class CategoriesService {
  constructor(private prismaService: PrismaService) { }
  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prismaService.category.create({
      data: createCategoryDto
    });

    return category;
  }

  async findAll() {
    const categories = await this.prismaService.category.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        user: {
          select: {
            name: true,
          }
        }
      }
    })
    return categories;
  }


  async findOne(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id: id
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    const updatedCategory = await this.prismaService.category.update({
      where:{
        id:id,
      },
      data:updateCategoryDto,
    })
    return updatedCategory;
  }

  async remove(id: string) {
    await this.findOne(id)
    const deletedCategory = await this.prismaService.category.delete({
      where:{
        id:id,
      }
    })
    return deletedCategory;
  }
}
