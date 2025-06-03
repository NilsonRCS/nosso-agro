import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../modules/users/entities/user.entity';
import { AuditLoggerService } from '../services/audit-logger.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockAuditLogger = {
    logAuth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuditLoggerService,
          useValue: mockAuditLogger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    };

    it('deve registrar usuário com sucesso', async () => {
      const user = {
        id: 'user-id',
        email: registerData.email,
        name: registerData.name,
      };
      const token = 'jwt-token';

      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.register(
        registerData.email,
        registerData.password,
        registerData.name,
        registerData.ip,
        registerData.userAgent,
      );

      expect(result).toEqual({ access_token: token });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(mockAuditLogger.logAuth).toHaveBeenCalledWith({
        userId: user.id,
        action: 'REGISTER',
        ip: registerData.ip,
        userAgent: registerData.userAgent,
        details: { email: registerData.email, name: registerData.name },
      });
    });

    it('deve logar erro quando registro falha', async () => {
      const error = new Error('Database error');
      mockUserRepository.create.mockReturnValue({});
      mockUserRepository.save.mockRejectedValue(error);

      await expect(
        service.register(
          registerData.email,
          registerData.password,
          registerData.name,
          registerData.ip,
          registerData.userAgent,
        ),
      ).rejects.toThrow(error);

      expect(mockAuditLogger.logAuth).toHaveBeenCalledWith({
        action: 'REGISTER',
        ip: registerData.ip,
        userAgent: registerData.userAgent,
        details: { email: registerData.email, error: error.message },
      });
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    };

    it('deve fazer login com sucesso', async () => {
      const user = {
        id: 'user-id',
        email: loginData.email,
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      const token = 'jwt-token';

      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(
        loginData.email,
        loginData.password,
        loginData.ip,
        loginData.userAgent,
      );

      expect(result).toEqual({ access_token: token });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(user.validatePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(mockAuditLogger.logAuth).toHaveBeenCalledWith({
        userId: user.id,
        action: 'LOGIN',
        ip: loginData.ip,
        userAgent: loginData.userAgent,
        details: { email: loginData.email },
      });
    });

    it('deve falhar quando usuário não existe', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login(
          loginData.email,
          loginData.password,
          loginData.ip,
          loginData.userAgent,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuditLogger.logAuth).toHaveBeenCalledWith({
        action: 'LOGIN_FAILED',
        ip: loginData.ip,
        userAgent: loginData.userAgent,
        details: { email: loginData.email, reason: 'User not found' },
      });
    });

    it('deve falhar quando senha é inválida', async () => {
      const user = {
        id: 'user-id',
        email: loginData.email,
        validatePassword: jest.fn().mockResolvedValue(false),
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(
        service.login(
          loginData.email,
          loginData.password,
          loginData.ip,
          loginData.userAgent,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuditLogger.logAuth).toHaveBeenCalledWith({
        userId: user.id,
        action: 'LOGIN_FAILED',
        ip: loginData.ip,
        userAgent: loginData.userAgent,
        details: { email: loginData.email, reason: 'Invalid password' },
      });
    });

    it('deve funcionar sem parâmetros opcionais', async () => {
      const user = {
        id: 'user-id',
        email: loginData.email,
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      const token = 'jwt-token';

      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(loginData.email, loginData.password);

      expect(result).toEqual({ access_token: token });
      expect(mockAuditLogger.logAuth).toHaveBeenCalledWith({
        userId: user.id,
        action: 'LOGIN',
        ip: undefined,
        userAgent: undefined,
        details: { email: loginData.email },
      });
    });
  });

  describe('generateToken', () => {
    it('deve gerar token corretamente', () => {
      const user = { id: 'user-id', email: 'test@example.com' };
      const expectedToken = 'jwt-token';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = service['generateToken'](user as any);

      expect(result).toEqual({ access_token: expectedToken });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });
  });
});
