import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BorrowStatus } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BorrowRequestsService } from './borrow-requests.service';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { UpdateBorrowRequestDto } from './dto/update-borrow-request.dto';

// Patron routes: any logged-in user
@Controller('borrow-requests')
@UseGuards(JwtAuthGuard)
export class BorrowRequestsController {
  constructor(private borrowRequestsService: BorrowRequestsService) {}

  // The patron asks to borrow a book (for example one from their reading list)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBorrowRequestDto) {
    return this.borrowRequestsService.create(user.userId, dto);
  }

  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.borrowRequestsService.findMine(user.userId);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.borrowRequestsService.cancelOwn(user.userId, id);
  }
}

// Librarian routes: JwtAuthGuard first (sets req.user), then RolesGuard (checks the role)
@Controller('admin/borrow-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('LIBRARIAN')
export class AdminBorrowRequestsController {
  constructor(private borrowRequestsService: BorrowRequestsService) {}

  @Get()
  findAll(@Query('status', new ParseEnumPipe(BorrowStatus, { optional: true })) status?: BorrowStatus) {
    return this.borrowRequestsService.findAll(status);
  }

  // Approve, decline (CANCELLED), hand over (BORROWED), mark OVERDUE or RETURNED
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBorrowRequestDto) {
    return this.borrowRequestsService.update(id, dto);
  }
}
