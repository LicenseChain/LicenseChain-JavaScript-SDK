/**
 * LicenseChain License Validator
 * 
 * Easy-to-use license validation functionality.
 */

import { LicenseChainClient } from './client';
import { ValidationResult, LicenseValidationRules, LicenseValidationContext } from './types';
import { LicenseChainException } from './exceptions';

export class LicenseValidator {
  private client: LicenseChainClient;

  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
  }) {
    this.client = new LicenseChainClient(config);
  }

  /**
   * Validate a license key
   */
  async validateLicense(
    licenseKey: string,
    appId?: string,
    context?: Partial<LicenseValidationContext>
  ): Promise<ValidationResult> {
    try {
      const result = await this.client.validateLicense(licenseKey, appId);
      return result;
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if license is valid (quick check)
   */
  async isValid(licenseKey: string, appId?: string): Promise<boolean> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      return result.valid;
    } catch {
      return false;
    }
  }

  /**
   * Get license information
   */
  async getLicenseInfo(licenseKey: string, appId?: string): Promise<ValidationResult | null> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      return result.valid ? result : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if license is expired
   */
  async isExpired(licenseKey: string, appId?: string): Promise<boolean> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      if (!result.valid || !result.license) {
        return true;
      }

      const expiresAt = result.license.expiresAt;
      if (!expiresAt) {
        return false;
      }

      return new Date(expiresAt) < new Date();
    } catch {
      return true;
    }
  }

  /**
   * Get days until expiration
   */
  async getDaysUntilExpiration(licenseKey: string, appId?: string): Promise<number | null> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      if (!result.valid || !result.license) {
        return null;
      }

      const expiresAt = result.license.expiresAt;
      if (!expiresAt) {
        return null;
      }

      const expDate = new Date(expiresAt);
      const now = new Date();
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    } catch {
      return null;
    }
  }

  /**
   * Validate multiple licenses
   */
  async validateLicenses(
    licenseKeys: string[],
    appId?: string
  ): Promise<ValidationResult[]> {
    const promises = licenseKeys.map(key => this.validateLicense(key, appId));
    return Promise.all(promises);
  }

  /**
   * Validate with custom validation rules
   */
  async validateWithRules(
    licenseKey: string,
    rules: LicenseValidationRules,
    appId?: string
  ): Promise<ValidationResult> {
    const result = await this.validateLicense(licenseKey, appId);

    if (!result.valid || !rules) {
      return result;
    }

    // Apply custom validation rules
    if (rules.maxUsage && result.license?.usageCount && result.license.usageCount > rules.maxUsage) {
      return {
        ...result,
        valid: false,
        error: 'Usage limit exceeded',
      };
    }

    if (rules.allowedFeatures && result.license?.features) {
      const invalidFeatures = result.license.features.filter(
        feature => !rules.allowedFeatures!.includes(feature)
      );
      if (invalidFeatures.length > 0) {
        return {
          ...result,
          valid: false,
          error: `Invalid features: ${invalidFeatures.join(', ')}`,
        };
      }
    }

    if (rules.requiredFeatures && result.license?.features) {
      const missingFeatures = rules.requiredFeatures.filter(
        feature => !result.license!.features.includes(feature)
      );
      if (missingFeatures.length > 0) {
        return {
          ...result,
          valid: false,
          error: `Missing required features: ${missingFeatures.join(', ')}`,
        };
      }
    }

    if (rules.allowedDomains && result.license?.metadata?.domain) {
      const domain = result.license.metadata.domain;
      if (!rules.allowedDomains.includes(domain)) {
        return {
          ...result,
          valid: false,
          error: `Domain not allowed: ${domain}`,
        };
      }
    }

    if (rules.allowedIPs && result.license?.metadata?.ipAddress) {
      const ipAddress = result.license.metadata.ipAddress;
      if (!rules.allowedIPs.includes(ipAddress)) {
        return {
          ...result,
          valid: false,
          error: `IP address not allowed: ${ipAddress}`,
        };
      }
    }

    return result;
  }

  /**
   * Check if license has specific feature
   */
  async hasFeature(licenseKey: string, feature: string, appId?: string): Promise<boolean> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      return result.valid && result.license?.features?.includes(feature) || false;
    } catch {
      return false;
    }
  }

  /**
   * Get license usage count
   */
  async getUsageCount(licenseKey: string, appId?: string): Promise<number | null> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      return result.valid ? result.license?.usageCount || 0 : null;
    } catch {
      return null;
    }
  }

  /**
   * Get license metadata
   */
  async getMetadata(licenseKey: string, appId?: string): Promise<Record<string, any> | null> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      return result.valid ? result.license?.metadata || {} : null;
    } catch {
      return null;
    }
  }

  /**
   * Get license features
   */
  async getFeatures(licenseKey: string, appId?: string): Promise<string[]> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      return result.valid ? result.license?.features || [] : [];
    } catch {
      return [];
    }
  }

  /**
   * Get user information from license
   */
  async getUserInfo(licenseKey: string, appId?: string): Promise<{
    email?: string;
    name?: string;
    id?: string;
  } | null> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      if (!result.valid) {
        return null;
      }

      return {
        email: result.user?.email,
        name: result.user?.name,
        id: result.user?.id,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get application information from license
   */
  async getAppInfo(licenseKey: string, appId?: string): Promise<{
    name?: string;
    id?: string;
  } | null> {
    try {
      const result = await this.validateLicense(licenseKey, appId);
      if (!result.valid) {
        return null;
      }

      return {
        name: result.app?.name,
        id: result.app?.id,
      };
    } catch {
      return null;
    }
  }

  /**
   * Validate license with context
   */
  async validateWithContext(
    context: LicenseValidationContext
  ): Promise<ValidationResult> {
    const { licenseKey, appId, ...additionalContext } = context;
    
    try {
      const result = await this.validateLicense(licenseKey, appId);
      
      if (!result.valid) {
        return result;
      }

      // Add context validation logic here
      // For example, validate IP address, user agent, etc.
      
      return result;
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Batch validate licenses with rules
   */
  async batchValidateWithRules(
    licenses: Array<{
      licenseKey: string;
      appId?: string;
      rules?: LicenseValidationRules;
    }>
  ): Promise<ValidationResult[]> {
    const promises = licenses.map(({ licenseKey, appId, rules }) =>
      rules
        ? this.validateWithRules(licenseKey, rules, appId)
        : this.validateLicense(licenseKey, appId)
    );
    
    return Promise.all(promises);
  }

  /**
   * Get client instance for advanced operations
   */
  getClient(): LicenseChainClient {
    return this.client;
  }

  /**
   * Update configuration
   */
  updateConfig(config: {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
  }): void {
    this.client.updateConfig(config);
  }
}
