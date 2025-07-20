import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersModule } from './users.module';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../../app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { $Enums } from '@prisma/client';

describe('Users Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPerson = {
    person_id: 'test-person-id',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '+1234567890',
    birthdate: new Date('1990-01-01'),
    gender: 'MALE' as $Enums.PersonGender,
    preferred_language: 'EN_US' as $Enums.PreferredLanguage,
    is_verified: true,
    created_at: new Date(),
    password: 'hashed-password',
  };

  const mockPersonHasRole = {
    person_has_role_id: 'test-user-id',
    person_id: 'test-person-id',
    role_id: 'test-role-id',
    is_active: true,
    created_at: new Date(),
    created_by: null,
  };

  const mockCybridCustomerUnverified = {
    cybrid_customer_id: 'test-cybrid-id',
    cybrid_customer_guid: 'test-guid',
    country: 'USA' as $Enums.CybridSupportedCountry,
    status: 'UNVERIFIED' as $Enums.CybridCustomerStatus,
    verification_status: 'PENDING' as $Enums.IdentityVerificationStatus,
    person_id: 'test-person-id',
    identity_verification_guid: null,
  };

  const mockCybridCustomerVerified = {
    ...mockCybridCustomerUnverified,
    verification_status: 'PASSED' as $Enums.IdentityVerificationStatus,
    status: 'VERIFIED' as $Enums.CybridCustomerStatus,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up test data
    jest.clearAllMocks();
  });

  const generateJwtToken = (userId: string): string => {
    return jwtService.sign(
      { sub: userId, type: 'access_token' },
      { secret: process.env.JWT_SECRET || 'test-secret' }
    );
  };

  describe('PATCH /users/profile', () => {
    beforeEach(() => {
      // Mock database calls
      jest.spyOn(prismaService.personHasRole, 'findUnique').mockResolvedValue({
        ...mockPersonHasRole,
        Person: mockPerson,
      });
    });

    describe('when user is not cybrid verified', () => {
      beforeEach(() => {
        jest.spyOn(prismaService.cybridCustomer, 'findFirst').mockResolvedValue(mockCybridCustomerUnverified);
        jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
          return await callback(prismaService);
        });
        jest.spyOn(prismaService.person, 'update').mockResolvedValue({
          ...mockPerson,
          email: 'updated@example.com',
          first_name: 'Jane',
        });
      });

      it('should successfully update all fields', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          email: 'updated@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          phone_number: '+9876543210',
          birthdate: '1992-05-15',
        };

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.email).toBe('updated@example.com');
        expect(response.body.first_name).toBe('Jane');
        expect(response.body.user_id).toBe('test-user-id');
        expect(response.body).not.toHaveProperty('person_id');
        expect(response.body).not.toHaveProperty('password');
      });

      it('should successfully update only email and phone_number', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          email: 'updated@example.com',
          phone_number: '+9876543210',
        };

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.email).toBe('updated@example.com');
        expect(response.body.user_id).toBe('test-user-id');
      });
    });

    describe('when user is cybrid verified', () => {
      beforeEach(() => {
        jest.spyOn(prismaService.cybridCustomer, 'findFirst').mockResolvedValue(mockCybridCustomerVerified);
      });

      it('should successfully update only email and phone_number', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          email: 'updated@example.com',
          phone_number: '+9876543210',
        };

        jest.spyOn(prismaService, '$transaction').mockImplementation(async (callback) => {
          return await callback(prismaService);
        });
        jest.spyOn(prismaService.person, 'update').mockResolvedValue({
          ...mockPerson,
          email: 'updated@example.com',
          phone_number: '+9876543210',
        });

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.email).toBe('updated@example.com');
        expect(response.body.phone_number).toBe('+9876543210');
      });

      it('should return 403 when trying to update first_name', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          first_name: 'Jane',
        };

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(403);

        expect(response.body.message).toBe('Cannot update first_name: Account is cybrid verified');
      });

      it('should return 403 when trying to update last_name', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          last_name: 'Smith',
        };

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(403);

        expect(response.body.message).toBe('Cannot update last_name: Account is cybrid verified');
      });

      it('should return 403 when trying to update birthdate', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          birthdate: '1992-05-15',
        };

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(403);

        expect(response.body.message).toBe('Cannot update birthdate: Account is cybrid verified');
      });

      it('should return 403 when trying to update multiple restricted fields', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'updated@example.com',
        };

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(403);

        expect(response.body.message).toBe('Cannot update first_name, last_name: Account is cybrid verified');
      });
    });

    describe('validation errors', () => {
      beforeEach(() => {
        jest.spyOn(prismaService.cybridCustomer, 'findFirst').mockResolvedValue(mockCybridCustomerUnverified);
      });

      it('should return 400 for invalid email format', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          email: 'invalid-email',
        };

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(400);

        expect(response.body.message).toContain('email must be an email');
      });

      it('should return 400 for invalid phone number format', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          phone_number: 'invalid-phone',
        };

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(400);

        expect(response.body.message).toContain('phone_number must be a valid phone number');
      });

      it('should return 400 for invalid date format', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          birthdate: 'invalid-date',
        };

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(400);

        expect(response.body.message).toContain('birthdate must be a valid ISO 8601 date string');
      });
    });

    describe('authentication errors', () => {
      it('should return 401 when no token provided', async () => {
        const updateData = {
          email: 'test@example.com',
        };

        await request(app.getHttpServer())
          .patch('/users/profile')
          .send(updateData)
          .expect(401);
      });

      it('should return 401 when invalid token provided', async () => {
        const updateData = {
          email: 'test@example.com',
        };

        await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', 'Bearer invalid-token')
          .send(updateData)
          .expect(401);
      });
    });

    describe('not found errors', () => {
      it('should return 404 when user not found', async () => {
        const token = generateJwtToken('non-existent-user-id');
        const updateData = {
          email: 'test@example.com',
        };

        jest.spyOn(prismaService.personHasRole, 'findUnique').mockResolvedValue(null);

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(404);

        expect(response.body.message).toBe('User not found');
      });

      it('should return 404 when cybrid customer not found', async () => {
        const token = generateJwtToken('test-user-id');
        const updateData = {
          email: 'test@example.com',
        };

        jest.spyOn(prismaService.cybridCustomer, 'findFirst').mockResolvedValue(null);

        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(404);

        expect(response.body.message).toBe('Cybrid customer not found');
      });
    });
  });
});