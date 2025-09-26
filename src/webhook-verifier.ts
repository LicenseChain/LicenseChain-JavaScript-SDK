/**
 * LicenseChain Webhook Verifier
 * 
 * Secure webhook verification and handling functionality.
 */

import * as crypto from 'crypto-js';
import { WebhookEvent, WebhookPayload, WebhookVerificationResult } from './types';
import { WebhookVerificationError } from './exceptions';

export class WebhookVerifier {
  private secret: string;

  constructor(secret: string) {
    if (!secret) {
      throw new WebhookVerificationError('Webhook secret is required');
    }
    this.secret = secret;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: string,
    signature: string,
    algorithm: string = 'sha256'
  ): boolean {
    try {
      const expectedSignature = this.generateSignature(payload, algorithm);
      return this.secureCompare(signature, expectedSignature);
    } catch {
      return false;
    }
  }

  /**
   * Parse and verify webhook payload
   */
  parsePayload(
    payload: string,
    signature: string,
    algorithm: string = 'sha256'
  ): WebhookEvent {
    if (!this.verifySignature(payload, signature, algorithm)) {
      throw new WebhookVerificationError('Invalid webhook signature');
    }

    try {
      const data = JSON.parse(payload);
      return this.extractEventData(data);
    } catch (error) {
      throw new WebhookVerificationError(`Invalid JSON payload: ${error}`);
    }
  }

  /**
   * Generate signature for testing
   */
  generateSignature(payload: string, algorithm: string = 'sha256'): string {
    let hash: string;

    switch (algorithm.toLowerCase()) {
      case 'sha1':
        hash = crypto.HmacSHA1(payload, this.secret).toString();
        break;
      case 'sha256':
        hash = crypto.HmacSHA256(payload, this.secret).toString();
        break;
      case 'sha512':
        hash = crypto.HmacSHA512(payload, this.secret).toString();
        break;
      default:
        throw new WebhookVerificationError(`Unsupported algorithm: ${algorithm}`);
    }

    return `${algorithm}=${hash}`;
  }

  /**
   * Verify webhook event type
   */
  verifyEventType(payload: WebhookEvent, expectedType: string): boolean {
    return payload.type === expectedType;
  }

  /**
   * Extract event data from webhook payload
   */
  extractEventData(payload: any): WebhookEvent {
    return {
      id: payload.id,
      type: payload.type || payload.event,
      createdAt: payload.created_at || payload.createdAt,
      data: payload.data || payload.object || {},
    };
  }

  /**
   * Verify webhook timestamp (prevent replay attacks)
   */
  verifyTimestamp(payload: WebhookEvent, tolerance: number = 300): boolean {
    const timestamp = payload.createdAt;
    if (!timestamp) {
      return true;
    }

    try {
      const eventTime = new Date(timestamp);
      const currentTime = new Date();
      const diffSeconds = Math.abs((currentTime.getTime() - eventTime.getTime()) / 1000);
      return diffSeconds <= tolerance;
    } catch {
      return false;
    }
  }

  /**
   * Securely compare two strings
   */
  private secureCompare(a: string, b: string): boolean {
    if (!a || !b || a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

export class WebhookHandler {
  private verifier: WebhookVerifier;
  private handlers: Map<string, (event: WebhookEvent) => Promise<any>> = new Map();

  constructor(secret: string) {
    this.verifier = new WebhookVerifier(secret);
    this.setupDefaultHandlers();
  }

  /**
   * Handle webhook payload
   */
  async handle(
    payload: string,
    signature: string,
    algorithm: string = 'sha256'
  ): Promise<WebhookVerificationResult> {
    try {
      // Parse and verify the payload
      const event = this.verifier.parsePayload(payload, signature, algorithm);

      // Verify timestamp to prevent replay attacks
      if (!this.verifier.verifyTimestamp(event)) {
        throw new WebhookVerificationError('Webhook timestamp is too old');
      }

      // Route to appropriate handler
      const result = await this.handleEvent(event);
      return { valid: true, event, ...result };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Route event to appropriate handler
   */
  private async handleEvent(event: WebhookEvent): Promise<any> {
    const handler = this.handlers.get(event.type) || this.handleUnknownEvent;
    return await handler(event);
  }

  /**
   * Register event handler
   */
  on(eventType: string, handler: (event: WebhookEvent) => Promise<any>): void {
    this.handlers.set(eventType, handler);
  }

  /**
   * Remove event handler
   */
  off(eventType: string): void {
    this.handlers.delete(eventType);
  }

  /**
   * Setup default handlers
   */
  private setupDefaultHandlers(): void {
    this.handlers.set('license.created', this.handleLicenseCreated.bind(this));
    this.handlers.set('license.updated', this.handleLicenseUpdated.bind(this));
    this.handlers.set('license.revoked', this.handleLicenseRevoked.bind(this));
    this.handlers.set('license.expired', this.handleLicenseExpired.bind(this));
    this.handlers.set('license.validated', this.handleLicenseValidated.bind(this));
    this.handlers.set('app.created', this.handleAppCreated.bind(this));
    this.handlers.set('app.updated', this.handleAppUpdated.bind(this));
    this.handlers.set('app.deleted', this.handleAppDeleted.bind(this));
    this.handlers.set('user.created', this.handleUserCreated.bind(this));
    this.handlers.set('user.updated', this.handleUserUpdated.bind(this));
  }

  // Default event handlers - override in subclasses or register custom handlers

  private async handleLicenseCreated(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'license.created' };
  }

  private async handleLicenseUpdated(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'license.updated' };
  }

  private async handleLicenseRevoked(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'license.revoked' };
  }

  private async handleLicenseExpired(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'license.expired' };
  }

  private async handleLicenseValidated(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'license.validated' };
  }

  private async handleAppCreated(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'app.created' };
  }

  private async handleAppUpdated(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'app.updated' };
  }

  private async handleAppDeleted(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'app.deleted' };
  }

  private async handleUserCreated(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'user.created' };
  }

  private async handleUserUpdated(event: WebhookEvent): Promise<any> {
    return { status: 'processed', event: 'user.updated' };
  }

  private async handleUnknownEvent(event: WebhookEvent): Promise<any> {
    return { status: 'ignored', event: event.type };
  }

  /**
   * Get verifier instance
   */
  getVerifier(): WebhookVerifier {
    return this.verifier;
  }

  /**
   * Get registered handlers
   */
  getHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all handlers
   */
  clearHandlers(): void {
    this.handlers.clear();
  }
}
