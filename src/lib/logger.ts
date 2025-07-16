type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly isClient = typeof window !== 'undefined';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error';
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: string, data?: unknown): string {
    const timestamp = this.formatTimestamp();
    const contextPart = context ? ` [${context}]` : '';
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${contextPart}`;

    if (data) {
      return `${prefix} ${message} | Data: ${JSON.stringify(data, null, 2)}`;
    }

    return `${prefix} ${message}`;
  }

  private logToConsole(level: LogLevel, formattedMessage: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }
  }

  private async logToServer(entry: LogEntry): Promise<void> {
    // Only send logs to server from client in production for errors and warnings
    if (!this.isClient || this.isDevelopment) return;
    if (entry.level !== 'error' && entry.level !== 'warn') return;

    try {
      // You can implement server-side logging endpoint here
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      // Silently fail - don't log logging errors
	  console.error("unexpected error", error as string);
    }
  }

  public debug(message: string, context?: string, data?: unknown): void {
    const formattedMessage = this.formatMessage('debug', message, context, data);
    this.logToConsole('debug', formattedMessage, data);
  }

  public info(message: string, context?: string, data?: unknown): void {
    const formattedMessage = this.formatMessage('info', message, context, data);
    this.logToConsole('info', formattedMessage, data);

    const entry: LogEntry = {
      level: 'info',
      message,
      timestamp: this.formatTimestamp(),
      context,
      data
    };
    this.logToServer(entry);
  }

  public warn(message: string, context?: string, data?: unknown): void {
    const formattedMessage = this.formatMessage('warn', message, context, data);
    this.logToConsole('warn', formattedMessage, data);

    const entry: LogEntry = {
      level: 'warn',
      message,
      timestamp: this.formatTimestamp(),
      context,
      data
    };
    this.logToServer(entry);
  }

  public error(message: string, context?: string, data?: unknown): void {
    const formattedMessage = this.formatMessage('error', message, context, data);
    this.logToConsole('error', formattedMessage, data);

    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: this.formatTimestamp(),
      context,
      data
    };
    this.logToServer(entry);
  }

  // Convenience methods for common use cases
  public auth(message: string, data?: unknown): void {
    this.info(message, 'AUTH', data);
  }

  public database(message: string, data?: unknown): void {
    this.info(message, 'DATABASE', data);
  }

  public api(message: string, data?: unknown): void {
    this.info(message, 'API', data);
  }

  public ui(message: string, data?: unknown): void {
    this.debug(message, 'UI', data);
  }

  // Performance logging
  public performance(operation: string, startTime: number, data?: unknown): void {
    const duration = performance.now() - startTime;
    this.info(`${operation} completed in ${duration.toFixed(2)}ms`, 'PERFORMANCE', data);
  }

  // Error boundary logging
  public reactError(error: Error, errorInfo: unknown): void {
    this.error('React Error Boundary caught an error', 'REACT', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo
    });
  }
}

// Create singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogLevel, LogEntry };

// Export class for testing or custom instances
export { Logger };
