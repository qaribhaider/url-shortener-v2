import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('General')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Welcome message with API docs link',
  })
  getHello(): { message: string; docs: string } {
    return {
      message: 'Welcome to URL Shortener API',
      docs: '/api',
    };
  }
}
