import { Controller, Post, Body, Get, Param, HttpStatus, Query, NotFoundException } from '@nestjs/common';
import { PaginatedUrlsResponse, ShortenerService } from './shortener.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { GetUrlsDto } from './dto/get-urls.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedUrlsDto } from './dto/paginated-urls.dto';

@ApiTags('shortener')
@Controller('shorten')
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the shortened URL code',
  })
  async shortenUrl(@Body() dto: ShortenUrlDto): Promise<{ shortCode: string }> {
    const shortCode = await this.shortenerService.shortenUrl(dto.url);
    return { shortCode };
  }

  @Get('urls')
  @ApiOperation({ summary: 'Get all URLs with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of URLs',
    type: PaginatedUrlsDto,
  })
  async getUrls(@Query() query: GetUrlsDto): Promise<PaginatedUrlsResponse> {
    return this.shortenerService.getUrls(query);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get original URL from short code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the original URL',
    schema: {
      type: 'object',
      properties: {
        originalUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Short code not found',
  })
  async getOriginalUrl(@Param('code') code: string): Promise<{ originalUrl: string }> {
    const originalUrl = await this.shortenerService.getOriginalUrl(code);
    if (!originalUrl) {
      throw new NotFoundException('Short code not found');
    }

    return { originalUrl };
  }
}
