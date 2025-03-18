# Remittance Platform

This repository, [xafpay/wallet](https://github.com/xafpay/wallet), contains a monorepo for a remittance platform leveraging Cybrid APIs. The platform comprises two main applications:

- **wallet-api**: A backend application built with NestJS, utilizing Prisma as the ORM.
- **customer-web**: A frontend application built with Next.js, utilizing MUI (Material-UI) as the UI library and TanStack Query for API interfacing.

The workspace is managed using Nx, with Docker employed for containerization.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup](#database-setup)
- [Development](#development)
  - [Running Applications](#running-applications)
  - [Building Applications](#building-applications)
- [Docker](#docker)
  - [Dockerfiles](#dockerfiles)
  - [Docker Compose](#docker-compose)
- [CI/CD Workflow](#cicd-workflow)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Ensure you have the following installed:

- **Node.js**:
  - Frontend (`customer-web`): Version 20.18.3
  - Backend (`wallet-api`): Latest version (v23)
- **npm**: For dependency management
- **Docker**: For containerization

## Getting Started

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/xafpay/wallet.git
   cd wallet
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

### Environment Configuration

1. **Environment Variables**:

   Create environment variable files for both applications based on the provided examples:

     ```bash
     cp .env.example .env
     ```

2. **Configure Variables**:

   Update the `.env` files with the appropriate values for your environment.

### Database Setup

1. **Start Database Services**:

   Ensure Docker is running, then start the PostgreSQL and Redis services:

   ```bash
   docker-compose up -d postgres redis
   ```

2. **Run Migrations**:

   Apply database migrations using Prisma:

   ```bash
   npx prisma migrate dev
   ```

## Development

### Running Applications

- **wallet-api**:

```bash
  npx nx serve wallet-api
```

- **customer-web**:

```bash
  npx nx serve customer-web
```

### Building Applications

- **wallet-api**:

```bash
  npx nx build wallet-api
```

- **customer-web**:

```bash
  npx nx build customer-web
```

## Docker

### Dockerfiles

Each application has its own Dockerfile located in their respective directories:

- `apps/wallet-api/Dockerfile`
- `apps/customer-web/Dockerfile`

These Dockerfiles define the build process for containerizing the applications.

### Docker Compose

The `docker-compose.yml` file in the root directory defines the services required for the platform, including:

- **wallet-api**
- **customer-web**
- **postgres**
- **redis**

To start all services:

```bash
docker-compose up --build
```

## CI/CD Workflow

The project includes a workflow file that builds the Docker images for both applications. Publishing and deployment are triggered only on the `main` event in the master branch. Ensure that your CI/CD pipeline is configured to handle these workflows appropriately.

## Contributing

Contributions are welcome! Please follow the standard Git workflow: fork the repository, create a new branch for your feature or bugfix, commit your changes, and open a pull request.

## License

This project is licensed under the [Proprietary License](LICENSE), asserting that the developers retain full ownership of the source code. This license restricts others from using, copying, modifying, or distributing the code without explicit permission from the copyright holders. For more details on protecting source code and asserting ownership, refer to this guide: citeturn0search9
