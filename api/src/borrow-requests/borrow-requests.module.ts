import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminBorrowRequestsController, BorrowRequestsController } from './borrow-requests.controller';
import { BorrowRequestsService } from './borrow-requests.service';

@Module({
  imports: [PrismaModule],
  controllers: [BorrowRequestsController, AdminBorrowRequestsController],
  providers: [BorrowRequestsService],
})
export class BorrowRequestsModule {}
