import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return welcome message with API docs link', () => {
      const result = appController.getHello();
      expect(result).toEqual({
        message: 'Welcome to URL Shortener API',
        docs: '/api',
      });
    });
  });
});
