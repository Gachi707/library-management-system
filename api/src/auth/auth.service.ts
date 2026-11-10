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
    const user = await this.prisma.user.create({
      data: { email, password: hashed },
    });
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      // Same message for "no such user" and "wrong password" on purpose
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueToken(user);
  }

  // Issuing a token happens here (once, at login/register);
  // verifying it happens later in JwtStrategy on every protected request.
  private issueToken(user: { id: number; role: string }) {
    return { access_token: this.jwt.sign({ sub: user.id, role: user.role }) };
  }
}
