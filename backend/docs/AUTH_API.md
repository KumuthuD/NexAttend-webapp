# NexAttend Authentication & User API Documentation

This document provides details for the authentication and user-related endpoints implemented in the NexAttend system.

## Overview
All API endpoints are prefixed with `/api/v1`.

## Authentication Endpoints

### 1. User Registration
Registers a new teacher or admin user.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "teacher"
  }
  ```
- **Success Response**: 
  - **Code**: 201 Created
  - **Content**: 
    ```json
    {
      "_id": "651a...",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "teacher",
      "is_active": true
    }
    ```

---

### 2. User Login
Authenticates a user and returns a JWT access token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response**: 
  - **Code**: 200 OK
  - **Content**: 
    ```json
    {
      "access_token": "eyJhbGci...",
      "token_type": "bearer"
    }
    ```
- **Error Response**: 
  - **Code**: 401 Unauthorized (`Incorrect email or password`)

---

## User Endpoints

### 3. Get Current User
Retrieves the profile of the currently authenticated user.

- **URL**: `/users/me`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)
- **Success Response**: 
  - **Code**: 200 OK
  - **Content**: 
    ```json
    {
      "_id": "651a...",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "teacher",
      "is_active": true
    }
    ```
- **Error Response**: 
  - **Code**: 401 Unauthorized (`Not authenticated`)
  - **Code**: 403 Forbidden (`Could not validate credentials`)

---

## Security Notes
- Passwords are hashed using **bcrypt**.
- Authentication is handled via **JWT (JSON Web Tokens)** with a default expiration of 30 minutes.
- All protected routes require the `Authorization: Bearer <token>` header.
