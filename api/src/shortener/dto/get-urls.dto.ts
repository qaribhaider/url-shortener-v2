import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortField {
  VISITS = 'visits',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetUrlsDto {
  @ApiPropertyOptional({ description: 'Start date for filtering URLs' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering URLs' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: SortField, description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
