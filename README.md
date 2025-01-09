# Url Shortener

The Url Shortener is a web application designed to shorten long Urls. It is built using Node.js, TypeScript, Express, PostgreSQL, Redis and Swagger for API documentation.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- TypeScript
- PostgreSQL
- Redis

## Installation

Follow these steps to get the application up and running on your local machine:

1. **Clone the repository**

2. **Navigate into the project folder**

3. **Install dependencies**

    ```bash
    npm install
    ```

## Configuration

The application uses environment variables for configuration. You will need to create a `.env` file in the root of the project with the following configuration:
# Environment Variables

## Server Configuration

- **`PORT`**: The port on which the server will run (default is `3000`).
- **`NODE_ENV`**: The environment in which the server is running. Set to `development` for local development and `production` for production.

## Database Configuration

- **`DB_HOST`**: Host of the database.
- **`DB_PORT`**: Port of the database.
- **`DB_USER`**: Database username.
- **`DB_PASSWORD`**: Database password.
- **`DB_DIALECT`**: Dialect for the database (e.g., `postgres`).
- **`DB_DATABASE`**: The name of the database.

## Logger Configuration

- **`ERROR_LOG_PATH`**: Path for storing error logs.
- **`COMBINED_LOG_PATH`**: Path for storing combined logs.

## Swagger Configuration

- **`SWAGGER_DOCS_ROUTE`**: The route for accessing the Swagger documentation (default is `/api-docs`).

## Google OAuth2 Configuration

- **`GOOGLE_CLIENT_ID`**: Google OAuth client ID.
- **`GOOGLE_CLIENT_SECRET`**: Google OAuth client secret.
- **`GOOGLE_REDIRECT_URI`**: URI for redirecting after Google OAuth authentication.
- **`GOOGLE_ISSUER`**: Issuer for Google OAuth.

## Redis Configuration

- **`REDIS_HOST`**: Host for the Redis instance.

### Run the Application Locally

1. **Start the application**

    To start the server in development mode:

    ```bash
    npm run start:dev
    ```

    This will start the application and listen on `localhost:${PORT}` (the port you have configured in the `.env` file).

### API Documentation (Swagger)

You can access the Swagger API documentation at the following URL: /api-docs

## Note

Unfortunately, the application could not be deployed due to some technical issues during the deployment process. I hope that this does not affect the evaluation. Thank you for your understanding.

