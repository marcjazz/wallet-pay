import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateProfileDto, UserEntity } from './user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    updateProfile: jest.fn(),
    getProfile: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '+1234567890',
          birthdate: new Date('1990-01-01'),
          gender: 'MALE',
          preferred_language: 'EN_US',
          is_verified: true,
          created_at: new Date()
        }
      } as any;

      mockUsersService.getProfile.mockResolvedValue(mockRequest.user);
      const result = await controller.getProfile(mockRequest);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.user_id).toBe('test-user-id');
      expect(result.email).toBe('test@example.com');
      expect(result.first_name).toBe('John');
      expect(result.last_name).toBe('Doe');
    });

    it('should throw UnauthorizedException when user is not connected', () => {
      const mockRequest = { user: null } as any;

      expect(() => controller.getProfile(mockRequest)).toThrow(
        new UnauthorizedException('User not connected!')
      );
    });
  });

  describe('updateProfile', () => {
    const mockRequest = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      }
    } as any;

    const mockUpdatedPerson = {
      person_id: 'test-person-id',
      email: 'updated@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      phone_number: '+9876543210',
      birthdate: new Date('1992-05-15'),
      gender: 'FEMALE',
      preferred_language: 'EN_US',
      is_verified: true,
      created_at: new Date(),
      password: 'hashed-password'
    };

    it('should update profile successfully', async () => {
      const updateDto: UpdateProfileDto = {
        email: 'updated@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        phone_number: '+9876543210',
        birthdate: '1992-05-15'
      };

      mockUsersService.updateProfile.mockResolvedValue(mockUpdatedPerson);

      const result = await controller.updateProfile(mockRequest, updateDto);

      expect(usersService.updateProfile).toHaveBeenCalledWith(
        'test-user-id',
        updateDto
      );

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.user_id).toBe('test-user-id');
      expect(result.email).toBe('updated@example.com');
      expect(result.first_name).toBe('Jane');
      expect(result.last_name).toBe('Smith');
      expect(result.phone_number).toBe('+9876543210');
      expect(result).not.toHaveProperty('person_id');
    });

    it('should throw UnauthorizedException when user is not connected', async () => {
      const mockRequestWithoutUser = { user: null } as any;
      const updateDto: UpdateProfileDto = { email: 'test@example.com' };

      await expect(
        controller.updateProfile(mockRequestWithoutUser, updateDto)
      ).rejects.toThrow(new UnauthorizedException('User not connected!'));

      expect(usersService.updateProfile).not.toHaveBeenCalled();
    });

    it('should handle ForbiddenException from service', async () => {
      const updateDto: UpdateProfileDto = {
        first_name: 'Jane'
      };

      mockUsersService.updateProfile.mockRejectedValue(
        new ForbiddenException(
          'Cannot update first_name: Account is cybrid verified'
        )
      );

      await expect(
        controller.updateProfile(mockRequest, updateDto)
      ).rejects.toThrow(
        new ForbiddenException(
          'Cannot update first_name: Account is cybrid verified'
        )
      );

      expect(usersService.updateProfile).toHaveBeenCalledWith(
        'test-user-id',
        updateDto
      );
    });

    it('should handle NotFoundException from service', async () => {
      const updateDto: UpdateProfileDto = {
        email: 'test@example.com'
      };

      mockUsersService.updateProfile.mockRejectedValue(
        new NotFoundException('User not found')
      );

      await expect(
        controller.updateProfile(mockRequest, updateDto)
      ).rejects.toThrow(new NotFoundException('User not found'));

      expect(usersService.updateProfile).toHaveBeenCalledWith(
        'test-user-id',
        updateDto
      );
    });

    it('should handle empty update object', async () => {
      const updateDto: UpdateProfileDto = {};

      mockUsersService.updateProfile.mockResolvedValue(mockUpdatedPerson);

      const result = await controller.updateProfile(mockRequest, updateDto);

      expect(usersService.updateProfile).toHaveBeenCalledWith(
        'test-user-id',
        updateDto
      );

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.user_id).toBe('test-user-id');
    });
  });
});
