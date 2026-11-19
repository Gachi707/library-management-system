import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

// Public: the booking form needs the list of spaces
@Controller('spaces')
export class SpacesController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  findAll() {
    return this.bookingsService.findSpaces();
  }
}

// Patron routes: any logged-in user
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // 201 when the slot is free, 409 Conflict when it overlaps an existing booking
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.userId, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.bookingsService.findMine(user.userId);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.cancel(user, id);
  }
}

// Librarian routes
@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LIBRARIAN')
export class AdminBookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  findAll(@Query('date') date?: string) {
    if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date must be in YYYY-MM-DD format');
    }
    return this.bookingsService.findAll(date);
  }
}
