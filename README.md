# Video Hosting Website Backend

Welcome to our video hosting website backend project! This project is a comprehensive backend solution built using Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, and more. It aims to provide all the features necessary for a video hosting platform similar to YouTube.

## Features

- **User Authentication**: Secure user authentication system with signup and login functionalities.
- **Token-based Authentication**: Utilizes JWT (JSON Web Tokens) for token-based authentication, ensuring secure and stateless communication.
- **Password Encryption**: User passwords are hashed using bcrypt for enhanced security.
- **Video Management**: Users can upload videos to the platform.
- **Engagement Features**: Users can like, dislike, comment, and reply to videos.
- **Subscription System**: Allows users to subscribe to channels and receive updates.
- **Standard Practices**: Adheres to best practices for security, including access tokens and refresh tokens.

## Technologies Used

- **Node.js**: JavaScript runtime for building scalable backend applications.
- **Express.js**: Web application framework for Node.js, providing robust features for building APIs.
- **MongoDB**: NoSQL database used for storing user data, videos, comments, and more.
- **Mongoose**: MongoDB object modeling tool for Node.js, providing a straightforward schema-based solution to model application data.
- **JWT**: JSON Web Tokens for secure authentication and authorization.
- **bcrypt**: Password hashing function used for encrypting user passwords.
- **Other Libraries**: Various npm packages and libraries are used to enhance functionality and maintain code quality.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository: `git clone https://github.com/Deepak-tect/Youtube.git`
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Create a `.env` file .
   - Populate the necessary environment variables, such as database connection URI, JWT secret, etc.
4. Start the server: `npm run dev`
