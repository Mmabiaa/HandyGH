# HandyGH Backend

HandyGH is a local services marketplace for Ghana, providing a platform for customers to connect with service providers. This README outlines the setup, configuration, and usage of the HandyGH backend.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Technologies Used

- Node.js with TypeScript
- Express.js
- PostgreSQL with Prisma ORM
- Redis with BullMQ
- AWS S3 for file storage
- JWT for authentication
- Zod for input validation
- Jest for testing

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/handygh-backend.git
   cd handygh-backend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up the environment variables:**
   Copy the `.env.example` to `.env` and fill in the required values.

## Configuration

The application configuration is managed through environment variables. Key configurations include:

- Database connection settings
- Redis configuration
- AWS S3 credentials
- JWT secret keys

## Running the Application

To start the application in development mode, run:

```bash
yarn start
```

The server will listen on the specified port (default: 3000).

## API Documentation

API documentation is auto-generated using Swagger. You can access it at:

```
http://localhost:3000/api-docs
```

## Testing

To run the test suite, use:

```bash
yarn test
```

This will execute all unit and integration tests.

## Deployment

For deployment, you can use Docker. Build the Docker image with:

```bash
docker build -t handygh-backend .
```

Then run the container:

```bash
docker run -p 3000:3000 --env-file .env handygh-backend
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.