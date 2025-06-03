import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const expectedMessage = 'Hello World!';
      mockAppService.getHello.mockReturnValue(expectedMessage);

      const result = appController.getHello();

      expect(result).toBe(expectedMessage);
      expect(mockAppService.getHello).toHaveBeenCalledTimes(1);
      expect(mockAppService.getHello).toHaveBeenCalledWith();
    });

    it('should handle different return values from service', () => {
      const customMessage = 'Custom Hello Message';
      mockAppService.getHello.mockReturnValue(customMessage);

      const result = appController.getHello();

      expect(result).toBe(customMessage);
      expect(mockAppService.getHello).toHaveBeenCalledTimes(1);
    });

    it('should call service method exactly once per request', () => {
      mockAppService.getHello.mockReturnValue('Hello World!');

      appController.getHello();
      appController.getHello();

      expect(mockAppService.getHello).toHaveBeenCalledTimes(2);
    });
  });
});
