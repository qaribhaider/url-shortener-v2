import { ApiProperty } from '@nestjs/swagger';
import { Url } from '../schemas/url.schema';

export class PaginationDto {
  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  pages: number;
}

export class PaginatedUrlsDto {
  @ApiProperty({ type: [Url], description: 'List of URLs' })
  urls: Url[];

  @ApiProperty({ type: PaginationDto, description: 'Pagination information' })
  pagination: PaginationDto;
}
