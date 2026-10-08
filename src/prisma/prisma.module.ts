import { Global, Module } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule{}