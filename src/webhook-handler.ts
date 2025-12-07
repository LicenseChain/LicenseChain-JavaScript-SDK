import { verifyWebhookSignature, jsonSerialize } from './utils';
import { ValidationException, AuthenticationException } from './exceptions';

export class WebhookHandler {
  private secret: string;
  private tolerance: number;

  constructor(secret: string, tolerance: number = 300) {
    this.secret = secret;
    this.tolerance = tolerance; // seconds
  }

  verifySignature(payload: string, signature: string): boolean {
    return verifyWebhookSignature(payload, signature, this.secret);
  }

  verifyTimestamp(timestamp: string): void {
    try {
      const webhookTime = new Date(timestamp);
      const currentTime = new Date();
      const timeDiff = Math.abs((currentTime.getTime() - webhookTime.getTime()) / 1000);
      
      if (timeDiff > this.tolerance) {
        throw new ValidationException(`Webhook timestamp too old: ${timeDiff} seconds`);
      }
    } catch (error) {
      throw new ValidationException(`Invalid timestamp format: ${error}`);
    }
  }

  verifyWebhook(payload: string, signature: string, timestamp: string): void {
    this.verifyTimestamp(timestamp);
    
    if (!this.verifySignature(payload, signature)) {
      throw new AuthenticationException('Invalid webhook signature');
    }
  }

  processEvent(eventData: any): void {
    const payload = jsonSerialize(eventData.data || {});
    this.verifyWebhook(payload, eventData.signature, eventData.timestamp);
    
    const eventType = eventData.type || '';
    
    switch (eventType) {
      case 'license.created':
        this.handleLicenseCreated(eventData);
        break;
      case 'license.updated':
        this.handleLicenseUpdated(eventData);
        break;
      case 'license.revoked':
        this.handleLicenseRevoked(eventData);
        break;
      case 'license.expired':
        this.handleLicenseExpired(eventData);
        break;
      case 'user.created':
        this.handleUserCreated(eventData);
        break;
      case 'user.updated':
        this.handleUserUpdated(eventData);
        break;
      case 'user.deleted':
        this.handleUserDeleted(eventData);
        break;
      case 'product.created':
        this.handleProductCreated(eventData);
        break;
      case 'product.updated':
        this.handleProductUpdated(eventData);
        break;
      case 'product.deleted':
        this.handleProductDeleted(eventData);
        break;
      case 'payment.completed':
        this.handlePaymentCompleted(eventData);
        break;
      case 'payment.failed':
        this.handlePaymentFailed(eventData);
        break;
      case 'payment.refunded':
        this.handlePaymentRefunded(eventData);
        break;
      default:
        console.log(`Unknown webhook event type: ${eventType}`);
    }
  }

  private handleLicenseCreated(eventData: any): void {
    console.log(`License created: ${eventData.id}`);
    // Add custom logic for license created event
  }

  private handleLicenseUpdated(eventData: any): void {
    console.log(`License updated: ${eventData.id}`);
    // Add custom logic for license updated event
  }

  private handleLicenseRevoked(eventData: any): void {
    console.log(`License revoked: ${eventData.id}`);
    // Add custom logic for license revoked event
  }

  private handleLicenseExpired(eventData: any): void {
    console.log(`License expired: ${eventData.id}`);
    // Add custom logic for license expired event
  }

  private handleUserCreated(eventData: any): void {
    console.log(`User created: ${eventData.id}`);
    // Add custom logic for user created event
  }

  private handleUserUpdated(eventData: any): void {
    console.log(`User updated: ${eventData.id}`);
    // Add custom logic for user updated event
  }

  private handleUserDeleted(eventData: any): void {
    console.log(`User deleted: ${eventData.id}`);
    // Add custom logic for user deleted event
  }

  private handleProductCreated(eventData: any): void {
    console.log(`Product created: ${eventData.id}`);
    // Add custom logic for product created event
  }

  private handleProductUpdated(eventData: any): void {
    console.log(`Product updated: ${eventData.id}`);
    // Add custom logic for product updated event
  }

  private handleProductDeleted(eventData: any): void {
    console.log(`Product deleted: ${eventData.id}`);
    // Add custom logic for product deleted event
  }

  private handlePaymentCompleted(eventData: any): void {
    console.log(`Payment completed: ${eventData.id}`);
    // Add custom logic for payment completed event
  }

  private handlePaymentFailed(eventData: any): void {
    console.log(`Payment failed: ${eventData.id}`);
    // Add custom logic for payment failed event
  }

  private handlePaymentRefunded(eventData: any): void {
    console.log(`Payment refunded: ${eventData.id}`);
    // Add custom logic for payment refunded event
  }
}

export class WebhookEvents {
  static readonly LICENSE_CREATED = 'license.created';
  static readonly LICENSE_UPDATED = 'license.updated';
  static readonly LICENSE_REVOKED = 'license.revoked';
  static readonly LICENSE_EXPIRED = 'license.expired';
  static readonly USER_CREATED = 'user.created';
  static readonly USER_UPDATED = 'user.updated';
  static readonly USER_DELETED = 'user.deleted';
  static readonly PRODUCT_CREATED = 'product.created';
  static readonly PRODUCT_UPDATED = 'product.updated';
  static readonly PRODUCT_DELETED = 'product.deleted';
  static readonly PAYMENT_COMPLETED = 'payment.completed';
  static readonly PAYMENT_FAILED = 'payment.failed';
  static readonly PAYMENT_REFUNDED = 'payment.refunded';
}

export function createOutgoingWebhookSignature(payload: string, secret: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyIncomingWebhookSignature(payload: string, signature: string, secret: string): boolean {
  return verifyWebhookSignature(payload, signature, secret);
}
