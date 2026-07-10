// src/core/utils/logger.ts

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  prefix?: string;
}

class Logger {
  private static instance: Logger;
  private config: LoggerConfig = {
    level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
    enabled: true,
    prefix: '[Yadakchi]',
  };

  static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger();
    }
    return this.instance;
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level >= this.config.level;
  }

  // حذف پارامتر data از formatMessage
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    return `${timestamp} ${this.config.prefix} [${levelName}] ${message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message);
    
    // استفاده از switch با case های جداگانه برای هر سطح
    switch (level) {
      case LogLevel.DEBUG:
        if (data !== undefined) {
          console.debug(formatted, data);
        } else {
          console.debug(formatted);
        }
        break;
      case LogLevel.INFO:
        if (data !== undefined) {
          console.info(formatted, data);
        } else {
          console.info(formatted);
        }
        break;
      case LogLevel.WARN:
        if (data !== undefined) {
          console.warn(formatted, data);
        } else {
          console.warn(formatted);
        }
        break;
      case LogLevel.ERROR:
        if (data !== undefined) {
          console.error(formatted, data);
        } else {
          console.error(formatted);
        }
        break;
      default:
        // سطح NONE - هیچ کاری نکن
        break;
    }
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data);
  }
}

export const logger = Logger.getInstance();