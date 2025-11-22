export class EtherscanError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number = 500, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'EtherscanError';
  }
}

export class APIError extends EtherscanError {
  private rawResult: any;

  constructor(message: string, result: any) {
    // Sanitize message
    const sanitized = APIError.sanitizeMessage(message);
    super(`Etherscan API Error: ${sanitized}`, 200, 'API_LOGIC_ERROR');

    // Store raw result but don't expose it in production
    this.rawResult = result;
  }

  private static sanitizeMessage(message: string): string {
    let sanitized = message;

    // Remove potential API keys - target 32-64 char hex strings that appear near API-related keywords
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('apikey') || lowerMessage.includes('key') || lowerMessage.includes('token')) {
      // More aggressive redaction when API-related keywords are present
      sanitized = sanitized.replace(/[a-fA-F0-9]{32,64}/g, '[REDACTED]');
    } else {
      // Conservative redaction - only very long hex strings that are likely API keys
      sanitized = sanitized.replace(/[a-fA-F0-9]{64,}/g, '[REDACTED]');
    }

    // Remove potential file paths
    sanitized = sanitized.replace(/\/[\w\-/.]+/g, '[PATH]');

    // Remove potential IP addresses
    sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');

    return sanitized;
  }

  // Only expose result in development
  get result() {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'API error occurred' };
    }
    return this.rawResult;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      // Don't include stack in production
      ...(process.env.NODE_ENV !== 'production' && {
        stack: this.stack,
        result: this.rawResult,
      }),
    };
  }
}

export class RateLimitError extends EtherscanError {
  constructor() {
    super('Etherscan Rate Limit Reached', 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class UnsupportedChainError extends EtherscanError {
  constructor(chainId: number, feature: string) {
    super(
      `Feature '${feature}' is not supported on Chain ID ${chainId}.`,
      400,
      'UNSUPPORTED_CHAIN'
    );
  }
}

export class ValidationError extends EtherscanError {
  constructor(message: string) {
    super(message, 500, 'SCHEMA_VALIDATION_ERROR');
  }
}
