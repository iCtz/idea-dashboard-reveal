# Logger Utility Documentation

## Overview

The logger utility provides a structured, environment-aware logging system for your Next.js application. It automatically handles development vs production logging, provides context-aware logging, and can be extended to send logs to external services.

## Basic Usage

```typescript
import { logger } from '@/lib/logger';

// Basic logging levels
logger.debug('Debug information for development');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred');
```

## Context-Aware Logging

```typescript
// With context
logger.info('User logged in', 'AUTH', { userId: '123', email: 'user@example.com' });
logger.error('Database connection failed', 'DATABASE', { connectionString: 'masked' });

// Convenience methods (automatically add context)
logger.auth('Login attempt', { email: 'user@example.com' });
logger.database('Query executed', { query: 'SELECT * FROM users', duration: '150ms' });
logger.api('Request processed', { endpoint: '/api/users', method: 'GET', status: 200 });
logger.ui('Component rendered', { component: 'UserProfile', props: {} });
```

## Performance Logging

```typescript
const startTime = performance.now();
// ... some operation
logger.performance('User data fetch', startTime, { userId: '123', recordCount: 50 });
```

## Error Boundary Integration

```typescript
// In your error boundary component
componentDidCatch(error: Error, errorInfo: any) {
  logger.reactError(error, errorInfo);
}
```

## Migration from console.log

### Before (with console.log)
```typescript
console.log('User logged in:', user);
console.error('Login failed:', error);
console.warn('Invalid input:', input);
```

### After (with logger)
```typescript
logger.auth('User logged in', { user: user.email, role: user.role });
logger.error('Login failed', 'AUTH', { error: error.message, email: user.email });
logger.warn('Invalid input detected', 'VALIDATION', { input, field: 'email' });
```

## Environment Behavior

### Development Mode
- All log levels are output to console
- Detailed formatting with timestamps
- No logs sent to server

### Production Mode
- Only warnings and errors are logged to console
- Critical errors can be sent to external logging service
- Reduced noise in browser console

## Best Practices

1. **Use appropriate log levels**:
   - `debug`: Development debugging info
   - `info`: General application flow
   - `warn`: Potentially harmful situations
   - `error`: Error events that might allow the application to continue

2. **Provide context**: Always include relevant context and data
   ```typescript
   // Good
   logger.error('Failed to save user profile', 'DATABASE', {
     userId,
     error: error.message,
     timestamp: new Date().toISOString()
   });

   // Avoid
   logger.error('Save failed');
   ```

3. **Use convenience methods**: Leverage the context-specific methods for common operations
   ```typescript
   logger.auth('Login successful', { userId, role });
   logger.database('Query executed', { table: 'users', duration: '120ms' });
   ```

4. **Performance monitoring**: Track critical operations
   ```typescript
   const startTime = performance.now();
   const data = await fetchUserData(userId);
   logger.performance('User data fetch', startTime, { userId, recordCount: data.length });
   ```

## Extending the Logger

You can extend the logger for specific use cases:

```typescript
import { Logger } from '@/lib/logger';

class CustomLogger extends Logger {
  public security(message: string, data?: any): void {
    this.warn(message, 'SECURITY', data);
  }

  public analytics(event: string, properties?: any): void {
    this.info(`Analytics event: ${event}`, 'ANALYTICS', properties);
  }
}

export const customLogger = new CustomLogger();
```

## Configuration

The logger automatically detects:
- Environment (development/production)
- Runtime context (client/server)
- Browser performance API availability

No additional configuration is needed for basic usage.
