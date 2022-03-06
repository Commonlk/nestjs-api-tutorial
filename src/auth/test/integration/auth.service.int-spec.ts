import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth/auth.service';
import { AuthDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

interface IPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

describe('AuthService int', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let config: ConfigService;

  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);
    config = moduleRef.get(ConfigService);

    jwt = new JwtService({ secret: config.get('JWT_SECRET') });

    await prisma.cleanDb();
  });

  describe('signup', () => {
    const dto: AuthDto = {
      email: 'test@test.com',
      password: 'test',
    };
    it('should signup the user', async () => {
      const token = await authService.signup(dto);
      const payload = jwt.decode(token.access_token, { json: true });
      const data: IPayload = JSON.parse(JSON.stringify(payload));

      expect(data.email).toBe(dto.email);
    });

    it('should throw on duplicate email', async () => {
      await authService
        .signup(dto)
        .then((token) => expect(token).toBeUndefined())
        .catch((error) => expect(error.status).toBe(403));
    });
  });

  describe('signin', () => {
    const dto: AuthDto = {
      email: 'test@test.com',
      password: 'test',
    };
    it('should signin the user', async () => {
      const token = await authService.signin(dto);
      const payload = jwt.decode(token.access_token, { json: true });
      const data: IPayload = JSON.parse(JSON.stringify(payload));

      expect(data.email).toBe(dto.email);
    });

    it('should throw on wrong email', async () => {
      await authService
        .signin({
          email: 'wrong@test.com',
          password: 'test',
        })
        .then((token) => expect(token).toBeUndefined())
        .catch((error) => expect(error.status).toBe(403));
    });

    it('should throw on wrong password', async () => {
      await authService
        .signin({
          email: 'test@test.com',
          password: 'wrong',
        })
        .then((token) => expect(token).toBeUndefined())
        .catch((error) => expect(error.status).toBe(403));
    });

    it('should throw on empty email, password', async () => {
      await authService
        .signin({
          email: '',
          password: '',
        })
        .then((token) => expect(token).toBeUndefined())
        .catch((error) => expect(error.status).toBe(403));
    });
  });
});
