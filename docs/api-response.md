# API Response Pattern

The API Response pattern provides a standardized structure for REST API responses, ensuring consistent error handling and predictable data format across services.

## Interface

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  details?: unknown;
}
```

## Error Class

```typescript
export class ApiResponseError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
```

## Core Components

- **success**: Boolean indicator of operation success
- **data**: Optional payload returned on successful operations
- **message**: Human-readable message about the operation
- **details**: Additional information about the response (errors, metadata, etc.)

## Implementation Example

```typescript
import express from 'express';
import { ApiResponse, ApiResponseError } from '@synet/patterns';

const app = express();

app.get('/users/:id', async (req, res) => {
  try {
    const user = await userService.findById(req.params.id);
  
    if (!user) {
      throw new ApiResponseError(404, 'User not found');
    }
  
    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: 'User retrieved successfully'
    };
  
    res.json(response);
  } catch (error) {
    if (error instanceof ApiResponseError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        details: error.details
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});
```

## Client Usage

```typescript
// Making a request
const response = await fetch('/users/123');
const result: ApiResponse<User> = await response.json();

if (result.success) {
  // Use the data
  console.log(result.data);
} else {
  // Handle the error
  console.error(result.message, result.details);
}
```

## Why 

1. **Consistency**: All API responses follow the same format
2. **Type Safety**: Generic typing for response data
3. **Error Propagation**: Structured error information with status codes
4. **Self-Documenting**: Clear status indication with detailed messages

This pattern ensures reliable communication between services and simplifies client-side interaction with your APIs by providing consistent structure and error handling.
