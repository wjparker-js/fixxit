# Fixxit API Documentation

This document provides details about all available API endpoints in the Fixxit application.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Endpoints

### Authentication

#### Register User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Authentication Required**: No
- **Request Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**:
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com"
      },
      "token": "jwt_token"
    }
    ```

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "message": "Login successful",
      "user": {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com"
      },
      "token": "jwt_token"
    }
    ```

### Reports

#### Create Report

- **URL**: `/reports`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `description`: Text description of the issue
  - `images`: Multiple image files (optional)
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**:
    ```json
    {
      "message": "Report created successfully",
      "report": {
        "id": "report_id",
        "description": "Description of the issue",
        "images": ["image_url_1", "image_url_2"],
        "status": "pending",
        "createdAt": "timestamp",
        "userId": "user_id"
      }
    }
    ```

#### Get User Reports

- **URL**: `/reports`
- **Method**: `GET`
- **Authentication Required**: Yes
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "reports": [
        {
          "id": "report_id_1",
          "description": "Description of the issue",
          "images": ["image_url_1", "image_url_2"],
          "status": "pending",
          "createdAt": "timestamp",
          "userId": "user_id"
        },
        {
          "id": "report_id_2",
          "description": "Another issue description",
          "images": ["image_url_3"],
          "status": "in_progress",
          "createdAt": "timestamp",
          "userId": "user_id"
        }
      ]
    }
    ```

### Work Orders

#### Create Work Order

- **URL**: `/workorders`
- **Method**: `POST`
- **Authentication Required**: Yes
- **Request Body**:
  ```json
  {
    "reportId": "report_id",
    "scheduledDate": "2023-07-15T10:00:00",
    "notes": "Additional notes about the work order"
  }
  ```
- **Success Response**:
  - **Code**: 201 CREATED
  - **Content**:
    ```json
    {
      "message": "Work order created successfully",
      "workOrder": {
        "id": "work_order_id",
        "reportId": "report_id",
        "scheduledDate": "2023-07-15T10:00:00",
        "notes": "Additional notes about the work order",
        "status": "scheduled",
        "createdAt": "timestamp"
      }
    }
    ```

## Error Responses

### Authentication Error

- **Code**: 401 UNAUTHORIZED
- **Content**:
  ```json
  {
    "error": "Authentication failed",
    "message": "Invalid credentials or token"
  }
  ```

### Validation Error

- **Code**: 400 BAD REQUEST
- **Content**:
  ```json
  {
    "error": "Validation error",
    "message": "Description of the validation error"
  }
  ```

### Resource Not Found

- **Code**: 404 NOT FOUND
- **Content**:
  ```json
  {
    "error": "Not found",
    "message": "The requested resource was not found"
  }
  ```

### Server Error

- **Code**: 500 INTERNAL SERVER ERROR
- **Content**:
  ```json
  {
    "error": "Server error",
    "message": "An unexpected error occurred"
  }
  ```