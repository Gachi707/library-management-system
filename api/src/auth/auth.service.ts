import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; // bcrypt hashing (pure-JS build, same algorithm)
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    // Never store the plain password: hash it first
    const hashed = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: { email, password: hashed },
      select: { id: true, email: true, role: true },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    const valid = user ? await bcrypt.compare(dto.password, user.password) : false;

    // Same message for "no such user" and "wrong password" on purpose
    if (!user || !valid) throw new UnauthorizedException('Invalid email or password');

    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
