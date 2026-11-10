import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() author: string;
  @IsString() @IsNotEmpty() isbn: string;
  @IsString() @IsNotEmpty() description: string;
  @IsOptional() @IsString() coverImage?: string;
  @IsInt() @Min(1) totalCopies: number;
  @IsInt() genreId: number;
}
