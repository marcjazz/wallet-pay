import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './user.dto';
import { Person } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Update user profile with validation for cybrid verification status
   * @param userId - PersonHasRole ID from JWT payload
   * @param updateData - Fields to update
   * @returns Updated person entity
   */
  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<Person> {
    // Get current user data
    const userWithRole = await this.prismaService.personHasRole.findUnique({
      where: { person_has_role_id: userId },
      include: { Person: true },
    });

    if (!userWithRole) {
      throw new NotFoundException('User not found');
    }

    const { Person: currentPerson } = userWithRole;

    // Check cybrid verification status
    const cybridCustomer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: currentPerson.person_id },
    });

    if (!cybridCustomer) {
      throw new NotFoundException('Cybrid customer not found');
    }

    const isCybridVerified = cybridCustomer.verification_status === 'PASSED';

    // Validate restricted fields for cybrid verified users
    if (isCybridVerified) {
      const restrictedFields = ['first_name', 'last_name', 'birthdate'];
      const attemptedRestrictedFields = restrictedFields.filter(
        (field) => updateData[field as keyof UpdateProfileDto] !== undefined
      );

      if (attemptedRestrictedFields.length > 0) {
        throw new ForbiddenException(
          `Cannot update birth data: Account is cybrid verified`
        );
      }
    }

    // Prepare update data
    const updatePayload: any = {};
    
    // Always editable fields
    if (updateData.email !== undefined) {
      updatePayload.email = updateData.email;
    }
    if (updateData.phone_number !== undefined) {
      updatePayload.phone_number = updateData.phone_number;
    }

    // Conditionally editable fields (only if not cybrid verified)
    if (!isCybridVerified) {
      if (updateData.first_name !== undefined) {
        updatePayload.first_name = updateData.first_name;
      }
      if (updateData.last_name !== undefined) {
        updatePayload.last_name = updateData.last_name;
      }
      if (updateData.birthdate !== undefined) {
        updatePayload.birthdate = new Date(updateData.birthdate);
      }
    }

    // Perform update within transaction
    return await this.prismaService.$transaction(async (prisma) => {
      // Update person data with audit trail
      const updatedPerson = await prisma.person.update({
        where: { person_id: currentPerson.person_id },
        data: {
          ...updatePayload,
          PersonAudits: {
            create: {
              email: currentPerson.email,
              first_name: currentPerson.first_name,
              last_name: currentPerson.last_name,
              phone_number: currentPerson.phone_number,
              birthdate: currentPerson.birthdate,
              gender: currentPerson.gender,
              preferred_language: currentPerson.preferred_language,
              password: currentPerson.password,
              is_verified: currentPerson.is_verified,
              AuditedBy: { connect: { person_has_role_id: userId } },
            },
          },
        },
      });

      return updatedPerson;
    });
  }

  /**
   * Returns whether the user with the given ID has been verified by Cybrid.
   * @param userId The ID of the user to check.
   * @throws {NotFoundException} If the user or cybrid customer is not found.
   * @returns true if the user is verified, false otherwise.
   */
  async getProfile(userId: string) {
    // Get current user data
    const userWithRole = await this.prismaService.personHasRole.findUnique({
      where: { person_has_role_id: userId },
      include: { Person: true }
    });

    if (!userWithRole) {
      throw new NotFoundException('User not found');
    }

    const { Person: currentPerson } = userWithRole;

    // Check cybrid verification status
    const cybridCustomer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: currentPerson.person_id }
    });

    if (!cybridCustomer) {
      throw new NotFoundException('Cybrid customer not found');
    }

    return cybridCustomer.verification_status === 'PASSED';
  }
}
