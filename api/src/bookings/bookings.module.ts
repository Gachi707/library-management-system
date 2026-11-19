import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminBookingsController, BookingsController, SpacesController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [PrismaModule],
  controllers: [SpacesController, BookingsController, AdminBookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
