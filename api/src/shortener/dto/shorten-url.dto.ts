import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShortenUrlDto {
  @ApiProperty({
    description: 'The URL to be shortened',
    example: 'https://example.com/very-long-url',
  })
  @IsNotEmpty()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  url: string;
}
