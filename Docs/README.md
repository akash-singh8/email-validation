# Email Verification Service

This repository contains the Swagger API documentation for email verification service that supports both OTP and Link-based verification methods.

## Features

- Two methods of email verification: OTP-based and Link-based.
- Swagger API documentation for easy reference.

## Tech Stack

- **Typescript**: The entire project is developed using Typescript for a more scalable and maintainable codebase.
- **Node.js**: The backend is built on Node.js, providing a robust and efficient runtime environment.
- **MongoDB**: A NoSQL database used for storing user data and verification details.
- **tsoa, OpenAPI Specs, Swagger UI**: Tools and technologies used for generating and displaying API documentation.

## Getting Started

Follow these steps to set up the project locally:

1. **Installation:** Clone the repository and install dependencies.

   ```bash
   git clone https://github.com/akash-singh8/email-verification.git
   cd email-verification/docs
   npm install
   ```

2. **Configuration:** Set up the environment variables

   ```plaintext
   a. Duplicate the ".env.example" file and rename it to ".env".
   b. Open the ".env" file and configure the environment variables as needed.
   ```

3. **Run the App:**

   To start the Docs server:

   ```bash
   npm run build
   npm start
   ```

4. **Explore:** Open your browser and navigate to `http://localhost:3080/docs` to start exploring the API.

<br>
