import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { AuditLoggerService } from '../services/audit-logger.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private auditLogger: AuditLoggerService,
  ) {}

  async register(email: string, password: string, name: string, ip?: string, userAgent?: string) {
    try {
      const user = this.userRepository.create({
        email,
        password,
        name,
      });

      const savedUser = await this.userRepository.save(user);
      
      // Log da operação de registro
      this.auditLogger.logAuth({
        userId: savedUser.id,
        action: 'REGISTER',
        ip,
        userAgent,
        details: { email, name },
      });

      return this.generateToken(savedUser);
    } catch (error) {
      // Log de erro no registro
      this.auditLogger.logAuth({
        action: 'REGISTER',
        ip,
        userAgent,
        details: { email, error: error.message },
      });
      throw error;
    }
  }

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Log de tentativa de login com email inexistente
      this.auditLogger.logAuth({
        action: 'LOGIN_FAILED',
        ip,
        userAgent,
        details: { email, reason: 'User not found' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      // Log de tentativa de login com senha incorreta
      this.auditLogger.logAuth({
        userId: user.id,
        action: 'LOGIN_FAILED',
        ip,
        userAgent,
        details: { email, reason: 'Invalid password' },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Log de login bem-sucedido
    this.auditLogger.logAuth({
      userId: user.id,
      action: 'LOGIN',
      ip,
      userAgent,
      details: { email },
    });

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
} 