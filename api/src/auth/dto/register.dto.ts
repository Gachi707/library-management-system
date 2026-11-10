import { IsEmail, IsString, MinLength } from 'class-validator';

// No "role" field on purpose: with whitelist: true any role sent by the
// client is stripped, so nobody can register themselves as a LIBRARIAN.
export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}
