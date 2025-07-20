# User Management System - Wallet API

## Overview
The wallet-api implements a robust user management system with role-based access control, multi-factor authentication, and comprehensive auditing. The system supports both local XAF currency operations and international banking through Cybrid integration.

## Core Architecture

### Database Schema (Prisma)
```
Person (Core User Entity)
├── PersonHasRole (User-Role Junction)
│   ├── Role (CLIENT/ADMIN)
│   └── Logs (Session tracking)
├── CybridCustomer (International banking)
│   ├── CybridAccount (USD/CAD accounts)
│   └── CybridExternalAccount (Bank connections)
├── LocalCustomer (XAF operations)
└── OTP (Two-factor authentication)
```

### Key Models

#### Person
- **Primary Entity**: Core user information
- **Fields**: person_id, email, password, first_name, last_name, phone_number, birthdate, gender, preferred_language, is_verified, created_at
- **Unique Constraints**: email
- **Security**: bcrypt password hashing, email verification required
- **Default Values**: is_verified=false, preferred_language=EN_US

#### PersonHasRole
- **Junction Table**: Links users to roles with additional metadata
- **Fields**: person_has_role_id, person_id, role_id, is_active, created_at, created_by
- **Purpose**: Enables role-based access control and user deactivation
- **JWT Subject**: Uses person_has_role_id as token subject
- **Default Values**: is_active=true

#### Role
- **Fields**: role_id, title, is_active, created_at, created_by
- **Common Titles**: CLIENT, ADMIN
- **Default**: New users get CLIENT role
- **Extensible**: Can add custom roles via RolesService
- **Default Values**: is_active=true

## Authentication Flow

### Registration Process
1. **Input Validation**: SignUpDto validates email, password strength, personal data, country
2. **Duplicate Check**: Ensures email uniqueness
3. **Cybrid Integration**: Creates customer with USD fiat account and USDC crypto account
4. **Database Transaction**:
   ```typescript
   Person.create({
     data: {
       ...userData,
       birthdate: new Date(payload.birthdate),
       password: bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds)),
       PersonHasRoles: { create: { Role: { connect: { title: 'CLIENT' }}}},
       LocalCustomers: { create: { balance: 0, currency: 'XAF', account_number: generateAccountNumber() }},
       CybridCustomers: { create: { 
         country, 
         status: customer.state,
         cybrid_customer_guid: customer.guid,
         CybridAccounts: { createMany: { data: [fiatAccount, cryptoAccount] }}
       }}
     }
   })
   ```

### Login Process
1. **Local Strategy**: Validates email/password via PassportJS LocalStrategy
2. **Role Verification**: Checks PersonHasRole.is_active and domain validation
3. **Email Verification**: Generates OTP for unverified users and sends verification email
4. **JWT Generation**: Creates access (15m) + refresh (7d) tokens
5. **Session Logging**: Records login in Log table with person_has_role_id

### JWT Token Structure
```typescript
interface IJWTPayload {
  sub: string;           // person_has_role_id
  type: 'access_token' | 'refresh_token';
  iat: number;
  exp: number;
}
```

### Authorization Guards
- **JwtAuthGuard**: Global authentication guard using JWT strategy
- **Email Verification**: Blocks unverified users (except auth, users, currencies, otp/request, resend routes)
- **Pilot User Check**: Launch-phase access restriction using isPilotUser() helper
- **Route Protection**: Uses @SkipAuth() decorator for public routes via IS_PUBLIC metadata

## Two-Factor Authentication

### OTP System
- **Fields**: otp_id, code, usage, is_verified, expires_at, created_at, updated_at, person_has_role_id
- **Usage Types**: VERIFY_EMAIL, RESET_PASSWORD, TRANSFER
- **Generation**: 5-digit codes with 5-minute expiry (fixed '55555' in test environment)
- **Delivery**: Email-based via MailerService
- **Verification**: One-time use with automatic invalidation (sets is_verified=true)

### Security Features
- **Test Environment**: Fixed OTP '55555' for testing
- **Rate Limiting**: Throttling via @nestjs/throttler
- **Expiry Enforcement**: Automatic cleanup of expired OTPs

## Core Endpoints

### Authentication Endpoints (`/api/auth`)

#### POST `/auth/sign-up`
- **Purpose**: User registration
- **Input**: SignUpDto (email, password, personal data, country)
- **Process**: Creates Person + PersonHasRole + LocalCustomer + CybridCustomer
- **Output**: JWT tokens + user profile
- **Side Effects**: Sends verification email

#### POST `/auth/sign-in`
- **Purpose**: User authentication
- **Input**: SignInDto (email, password)
- **Guard**: LocalStrategy (passport-local)
- **Output**: JWT tokens + session logging
- **Validation**: Checks user.is_active status

#### POST `/auth/forgot-password`
- **Purpose**: Password reset initiation
- **Input**: ForgotPasswordDto (email)
- **Process**: Generates OTP, sends reset email
- **Output**: OTP entity for verification

#### POST `/auth/reset-password`
- **Purpose**: Password reset completion
- **Input**: ResetPasswordDto (otp_id, otp_code, new_password)
- **Validation**: Verifies OTP before password update
- **Security**: OTP single-use enforcement

### User Management Endpoints (`/api/users`)

#### GET `/users/profile`
- **Purpose**: Retrieve current user profile
- **Authentication**: Required (JWT)
- **Output**: UserEntity (sanitized user data)
- **Security**: Excludes password, internal IDs

#### PATCH `/users/profile`
- **Purpose**: Update user profile information
- **Authentication**: Required (JWT)
- **Input**: UpdateProfileDto (first_name, last_name, email, phone_number, birthdate)
- **Validation**: Cybrid verification status determines editable fields
- **Always Editable**: email, phone_number
- **Conditionally Editable**: first_name, last_name, birthdate (only if NOT cybrid verified)
- **Output**: Updated UserEntity
- **Security**: Creates PersonAudit record for changes
- **Error Responses**: 
  - 400: Invalid input data
  - 403: Cannot update restricted fields - account is cybrid verified
  - 404: User not found

### Two-Factor Authentication (`/api/two-fa/otp`)

#### POST `/otp/request`
- **Purpose**: Generate OTP for various operations
- **Input**: OTPUsageDto (usage type)
- **Authentication**: Required
- **Process**: Creates OTP, sends email
- **Output**: OTP entity (code excluded)

#### PATCH `/otp/:otp_id/resend`
- **Purpose**: Resend OTP code
- **Authentication**: Required
- **Process**: Updates existing OTP, sends new email
- **Rate Limiting**: Protected by throttling

#### POST `/otp/verify`
- **Purpose**: Verify OTP code
- **Input**: OTPPayloadDto (otp_id, code)
- **Authentication**: Not required (public verification)
- **Output**: Boolean verification status

## Key Services

### AuthService (`apps/wallet-api/src/app/auth/auth.service.ts`)
- **validateUser()**: Email/password validation with domain and role checking
- **registerUser()**: Complete user registration flow with Cybrid integration
- **login()**: JWT token generation with OTP handling for unverified users
- **validateJwtPayload()**: Token verification for guards with type checking
- **requestForgotPasswordOTP()**: Initiates password reset with OTP
- **resetPassword()**: Completes password reset with OTP verification
- **refreshAuthTokens()**: Refreshes access tokens using refresh token
- **logout()**: Invalidates user sessions by updating logout_at timestamp
- **verifyEmail()**: Verifies email using OTP and updates is_verified status

### OTPService (`apps/wallet-api/src/app/two-fa/otp/otp.service.ts`)
- **request()**: OTP generation and storage with 5-minute expiry
- **verify()**: OTP validation with usage checking and expiry validation
- **resend()**: OTP regeneration for existing requests with new expiry

### RolesService (`apps/wallet-api/src/app/auth/roles.service.ts`)
- **create()**: Role creation with creator person_id connection
- **findOne()**: Role lookup by role_id
- **findByTitle()**: Role lookup by title
- **Extensible**: Supports custom role creation through Prisma operations

### UsersService (`apps/wallet-api/src/modules/users/users.service.ts`)
- **updateProfile()**: Update user profile with cybrid verification validation
- **Cybrid Verification Check**: Validates if user can edit restricted fields
- **Audit Trail**: Creates PersonAudit record for all profile changes
- **Transaction Safety**: Uses database transactions for data consistency
- **Field Validation**: Enforces business rules for editable fields

## Security Considerations

### Password Security
- **Hashing**: bcrypt with configurable salt rounds
- **Strength**: Enforced via @IsStrongPassword() validator
- **Reset**: Secure OTP-based reset flow

### Session Management
- **JWT Expiry**: 15 minutes for access tokens, 7 days for refresh tokens
- **Refresh Tokens**: Long-lived for token renewal with session validation
- **Session Logging**: Login/logout timestamps in Log table
- **Token Validation**: Requires active session log entry for refresh operations

### Access Control
- **Role-based**: CLIENT vs ADMIN permissions
- **Route-level**: @SkipAuth() for public endpoints
- **Status-based**: is_active flag for user deactivation

### Audit Trail
- **Comprehensive Logging**: All user actions tracked
- **Data Auditing**: Change history for critical entities
- **Session Tracking**: Login/logout timestamps

## Integration Points

### Cybrid Banking Integration
- **Customer Creation**: Automatic USD account setup
- **Identity Verification**: KYC/AML compliance
- **Transaction Processing**: International remittances

### Local Currency Operations
- **XAF Accounts**: Local customer management with generated account numbers
- **Account Numbers**: Auto-generated unique identifiers via generateAccountNumber()
- **Balance Tracking**: Real-time balance updates
- **Verification Status**: Supports UNVERIFIED, PENDING, VERIFIED states

### Email System
- **Verification**: Account activation emails
- **OTP Delivery**: Security code distribution
- **Notifications**: Transaction alerts, password resets

## Error Handling

### Common Exceptions
- **ConflictException**: Duplicate email registration
- **UnauthorizedException**: Invalid credentials
- **ForbiddenException**: Insufficient permissions, unverified email
- **NotFoundException**: Invalid user/token references

### Validation
- **DTO Validation**: Comprehensive input validation
- **Business Logic**: Custom validation for OTP, roles
- **Database Constraints**: Enforced uniqueness, foreign keys

## Development Notes

### Environment Configuration
- **JWT_SECRET**: Token signing key
- **SALT_ROUNDS**: Password hashing complexity
- **PILOT_USER_EMAILS**: Launch phase access list
- **DATABASE_URL**: PostgreSQL connection string

### Testing Considerations
- **Fixed OTP**: '55555' in test environment
- **Mock Services**: Cybrid integration mocking
- **Test Data**: Seeded roles and currencies

## Additional Models and Relationships

### Audit Trail Models
- **PersonAudit**: Tracks changes to person data with audited_by reference
- **PersonHasRoleAudit**: Tracks role assignment changes
- **RoleAudit**: Tracks role definition changes
- **CybridCustomerAudit**: Tracks customer status changes
- **SupportedCurrencyAudit**: Tracks currency configuration changes

### Transaction Models
- **LocalTransaction**: P2P transfers between local customers
- **CybridTransaction**: International transactions through Cybrid
- **StripeTransaction**: Stripe-based payment processing

### Account Models
- **LocalCustomer**: XAF currency accounts with verification status
- **CybridCustomer**: International banking customer profiles
- **CybridAccount**: USD/CAD fiat and crypto accounts
- **CybridExternalAccount**: Connected external bank accounts

### Supporting Models
- **CybridCounterparty**: Recipients for international transfers
- **ReceiverBankPayoutInfo**: Bank account details for payouts
- **Log**: User session tracking (login_at, logout_at, method)
- **SupportedCurrency**: Exchange rates and currency management

## Database Relationships Summary

```
Person (1) ──→ (M) PersonHasRole ──→ (1) Role
Person (1) ──→ (M) LocalCustomer
Person (1) ──→ (M) CybridCustomer ──→ (M) CybridAccount
Person (1) ──→ (M) CybridCounterparty

PersonHasRole (1) ──→ (M) OTP
PersonHasRole (1) ──→ (M) Log
PersonHasRole (1) ──→ (M) LocalTransaction [initiated_by]
PersonHasRole (1) ──→ (M) StripeTransaction [created_by]

LocalCustomer (1) ──→ (M) LocalTransaction [sent_by/received_by]
CybridCustomer (1) ──→ (M) CybridTransaction [initiated_by]
CybridAccount (1) ──→ (M) CybridTransaction [cybrid_account_id]
```

## File Structure Reference

### Core Authentication Files
- `apps/wallet-api/src/app/auth/auth.service.ts`: Main authentication service
- `apps/wallet-api/src/app/auth/auth.controller.ts`: Authentication endpoints
- `apps/wallet-api/src/app/auth/jwt/jwt.strategy.ts`: JWT validation strategy
- `apps/wallet-api/src/app/auth/jwt/jwt-auth.guard.ts`: JWT authentication guard
- `apps/wallet-api/src/app/auth/local/local.strategy.ts`: Local auth strategy
- `apps/wallet-api/src/app/auth/roles.service.ts`: Role management service

### Two-Factor Authentication Files
- `apps/wallet-api/src/app/two-fa/otp/otp.service.ts`: OTP generation and verification
- `apps/wallet-api/src/app/two-fa/otp/otp.controller.ts`: OTP endpoints
- `apps/wallet-api/src/app/two-fa/two-fa.interface.ts`: 2FA type definitions

### User Management Files
- `apps/wallet-api/src/modules/users/users.controller.ts`: User profile endpoints
- `apps/wallet-api/src/modules/users/user.dto.ts`: User data transfer objects
- `apps/wallet-api/src/app/auth/auth.dto.ts`: Authentication DTOs

### Helper Files
- `apps/wallet-api/src/helpers/otp-generator.ts`: OTP and account number generation
- `apps/wallet-api/src/helpers/utils.ts`: Utility functions including pilot user validation

## Key Environment Variables

- `JWT_SECRET`: Secret key for JWT token signing
- `SALT_ROUNDS`: bcrypt salt rounds for password hashing
- `PILOT_USER_EMAILS`: Comma-separated list of pilot user emails
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (test uses fixed OTP '55555')

## Common User Management Tasks

### Creating a New User
1. Validate SignUpDto input
2. Check email uniqueness
3. Create Cybrid customer and accounts
4. Create Person with hashed password
5. Create PersonHasRole with CLIENT role
6. Create LocalCustomer with XAF account
7. Send verification email with OTP

### Authenticating a User
1. Validate credentials via LocalStrategy
2. Check PersonHasRole.is_active
3. Generate access/refresh tokens
4. Log session in Log table
5. Handle email verification if needed

### Handling Password Reset
1. Validate email exists
2. Generate RESET_PASSWORD OTP
3. Send reset email
4. Verify OTP on reset request
5. Update password with bcrypt hash
6. Create PersonAudit entry

### Managing User Roles
1. Use RolesService.findByTitle() to get role
2. Create/update PersonHasRole record
3. Set is_active appropriately
4. Log changes in PersonHasRoleAudit

### Updating User Profile
1. Validate JWT token and extract user ID
2. Check cybrid verification status
3. Validate attempted field changes against restrictions
4. Create PersonAudit record with previous values
5. Update Person record with new values
6. Return sanitized user data

### Cybrid Verification Impact
- **Unverified Users**: Can edit all profile fields (email, phone_number, first_name, last_name, birthdate)
- **Verified Users**: Can only edit email and phone_number
- **Verification Check**: Based on CybridCustomer.verification_status === 'PASSED'
- **Error Handling**: Clear error messages for restricted field updates

This system provides enterprise-grade user management with proper security, scalability, and maintainability considerations.