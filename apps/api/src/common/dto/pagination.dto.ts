import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import type { Pagination } from '@supperajan/types';

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => parseInt(String(value), 10))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
): Pagination {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    totalItems: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function toPrismaSkipTake(
  page: number,
  pageSize: number,
): { skip: number; take: number } {
  return { skip: (page - 1) * pageSize, take: pageSize };
}
