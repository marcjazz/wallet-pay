import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './user.dto';
import { $Enums } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    person: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    personHasRole: {
      findUnique: jest.fn(),
    },
    cybridCustomer: {
      findFirst: jest.fn(),
    },
    personAudit: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    const mockUserId = 'test-user-id';
    const mockPersonId = 'test-person-id';
    
    const mockPersonHasRole = {
      person_has_role_id: mockUserId,
      person_id: mockPersonId,
      is_active: true,
      Person: {
        person_id: mockPersonId,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+1234567890',
        birthdate: new Date('1990-01-01'),
        gender: 'MALE' as $Enums.PersonGender,
        preferred_language: 'EN_US' as $Enums.PreferredLanguage,
        password: 'hashed-password',
        is_verified: true,
        created_at: new Date(),
      },
    };

    const mockCybridCustomerUnverified = {
      cybrid_customer_id: 'test-cybrid-id',
      verification_status: 'PENDING' as $Enums.IdentityVerificationStatus,
    };

    const mockCybridCustomerVerified = {
      cybrid_customer_id: 'test-cybrid-id',
      verification_status: 'PASSED' as $Enums.IdentityVerificationStatus,
    };

    beforeEach(() => {
      mockPrismaService.personHasRole.findUnique.mockResolvedValue(mockPersonHasRole);
    });

    describe('when user is not cybrid verified', () => {
      beforeEach(() => {
        mockPrismaService.cybridCustomer.findFirst.mockResolvedValue(mockCybridCustomerUnverified);
      });

      it('should successfully update all fields', async () => {
        const updateDto: UpdateProfileDto = {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone_number: '+9876543210',
          birthdate: '1992-05-15',
        };

        const updatedPerson = {
          ...mockPersonHasRole.Person,
          ...updateDto,
          birthdate: new Date(updateDto.birthdate),
        };

        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback(mockPrismaService);
        });

        mockPrismaService.person.update.mockResolvedValue(updatedPerson);

        const result = await service.updateProfile(mockUserId, updateDto);

        expect(mockPrismaService.person.update).toHaveBeenCalledWith({
          where: { person_id: mockPersonId },
          data: {
            first_name: updateDto.first_name,
            last_name: updateDto.last_name,
            email: updateDto.email,
            phone_number: updateDto.phone_number,
            birthdate: new Date(updateDto.birthdate),
            PersonAudits: {
              create: {
                email: mockPersonHasRole.Person.email,
                first_name: mockPersonHasRole.Person.first_name,
                last_name: mockPersonHasRole.Person.last_name,
                phone_number: mockPersonHasRole.Person.phone_number,
                birthdate: mockPersonHasRole.Person.birthdate,
                gender: mockPersonHasRole.Person.gender,
                preferred_language: mockPersonHasRole.Person.preferred_language,
                password: mockPersonHasRole.Person.password,
                is_verified: mockPersonHasRole.Person.is_verified,
                AuditedBy: { connect: { person_has_role_id: mockUserId } },
              },
            },
          },
        });

        expect(result).toEqual(updatedPerson);
      });

      it('should successfully update only email and phone_number', async () => {
        const updateDto: UpdateProfileDto = {
          email: 'newemail@example.com',
          phone_number: '+5555555555',
        };

        const updatedPerson = {
          ...mockPersonHasRole.Person,
          ...updateDto,
        };

        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback(mockPrismaService);
        });

        mockPrismaService.person.update.mockResolvedValue(updatedPerson);

        const result = await service.updateProfile(mockUserId, updateDto);

        expect(mockPrismaService.person.update).toHaveBeenCalledWith({
          where: { person_id: mockPersonId },
          data: {
            email: updateDto.email,
            phone_number: updateDto.phone_number,
            PersonAudits: {
              create: {
                email: mockPersonHasRole.Person.email,
                first_name: mockPersonHasRole.Person.first_name,
                last_name: mockPersonHasRole.Person.last_name,
                phone_number: mockPersonHasRole.Person.phone_number,
                birthdate: mockPersonHasRole.Person.birthdate,
                gender: mockPersonHasRole.Person.gender,
                preferred_language: mockPersonHasRole.Person.preferred_language,
                password: mockPersonHasRole.Person.password,
                is_verified: mockPersonHasRole.Person.is_verified,
                AuditedBy: { connect: { person_has_role_id: mockUserId } },
              },
            },
          },
        });

        expect(result).toEqual(updatedPerson);
      });
    });

    describe('when user is cybrid verified', () => {
      beforeEach(() => {
        mockPrismaService.cybridCustomer.findFirst.mockResolvedValue(mockCybridCustomerVerified);
      });

      it('should successfully update only email and phone_number', async () => {
        const updateDto: UpdateProfileDto = {
          email: 'newemail@example.com',
          phone_number: '+5555555555',
        };

        const updatedPerson = {
          ...mockPersonHasRole.Person,
          ...updateDto,
        };

        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback(mockPrismaService);
        });

        mockPrismaService.person.update.mockResolvedValue(updatedPerson);

        const result = await service.updateProfile(mockUserId, updateDto);

        expect(mockPrismaService.person.update).toHaveBeenCalledWith({
          where: { person_id: mockPersonId },
          data: {
            email: updateDto.email,
            phone_number: updateDto.phone_number,
            PersonAudits: {
              create: {
                email: mockPersonHasRole.Person.email,
                first_name: mockPersonHasRole.Person.first_name,
                last_name: mockPersonHasRole.Person.last_name,
                phone_number: mockPersonHasRole.Person.phone_number,
                birthdate: mockPersonHasRole.Person.birthdate,
                gender: mockPersonHasRole.Person.gender,
                preferred_language: mockPersonHasRole.Person.preferred_language,
                password: mockPersonHasRole.Person.password,
                is_verified: mockPersonHasRole.Person.is_verified,
                AuditedBy: { connect: { person_has_role_id: mockUserId } },
              },
            },
          },
        });

        expect(result).toEqual(updatedPerson);
      });

      it('should throw ForbiddenException when trying to update first_name', async () => {
        const updateDto: UpdateProfileDto = {
          first_name: 'Jane',
        };

        await expect(service.updateProfile(mockUserId, updateDto)).rejects.toThrow(
          new ForbiddenException('Cannot update first_name: Account is cybrid verified')
        );
      });

      it('should throw ForbiddenException when trying to update last_name', async () => {
        const updateDto: UpdateProfileDto = {
          last_name: 'Smith',
        };

        await expect(service.updateProfile(mockUserId, updateDto)).rejects.toThrow(
          new ForbiddenException('Cannot update last_name: Account is cybrid verified')
        );
      });

      it('should throw ForbiddenException when trying to update birthdate', async () => {
        const updateDto: UpdateProfileDto = {
          birthdate: '1992-05-15',
        };

        await expect(service.updateProfile(mockUserId, updateDto)).rejects.toThrow(
          new ForbiddenException('Cannot update birthdate: Account is cybrid verified')
        );
      });

      it('should throw ForbiddenException when trying to update multiple restricted fields', async () => {
        const updateDto: UpdateProfileDto = {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
        };

        await expect(service.updateProfile(mockUserId, updateDto)).rejects.toThrow(
          new ForbiddenException('Cannot update first_name, last_name: Account is cybrid verified')
        );
      });
    });

    describe('error cases', () => {
      it('should throw NotFoundException when user does not exist', async () => {
        mockPrismaService.personHasRole.findUnique.mockResolvedValue(null);

        const updateDto: UpdateProfileDto = {
          email: 'test@example.com',
        };

        await expect(service.updateProfile(mockUserId, updateDto)).rejects.toThrow(
          new NotFoundException('User not found')
        );
      });

      it('should throw NotFoundException when cybrid customer does not exist', async () => {
        mockPrismaService.cybridCustomer.findFirst.mockResolvedValue(null);

        const updateDto: UpdateProfileDto = {
          email: 'test@example.com',
        };

        await expect(service.updateProfile(mockUserId, updateDto)).rejects.toThrow(
          new NotFoundException('Cybrid customer not found')
        );
      });

      it('should handle empty update object', async () => {
        const updateDto: UpdateProfileDto = {};

        mockPrismaService.cybridCustomer.findFirst.mockResolvedValue(mockCybridCustomerUnverified);
        mockPrismaService.$transaction.mockImplementation(async (callback) => {
          return await callback(mockPrismaService);
        });

        mockPrismaService.person.update.mockResolvedValue(mockPersonHasRole.Person);

        const result = await service.updateProfile(mockUserId, updateDto);

        expect(mockPrismaService.person.update).toHaveBeenCalledWith({
          where: { person_id: mockPersonId },
          data: {
            PersonAudits: {
              create: {
                email: mockPersonHasRole.Person.email,
                first_name: mockPersonHasRole.Person.first_name,
                last_name: mockPersonHasRole.Person.last_name,
                phone_number: mockPersonHasRole.Person.phone_number,
                birthdate: mockPersonHasRole.Person.birthdate,
                gender: mockPersonHasRole.Person.gender,
                preferred_language: mockPersonHasRole.Person.preferred_language,
                password: mockPersonHasRole.Person.password,
                is_verified: mockPersonHasRole.Person.is_verified,
                AuditedBy: { connect: { person_has_role_id: mockUserId } },
              },
            },
          },
        });

        expect(result).toEqual(mockPersonHasRole.Person);
      });
    });
  });
});