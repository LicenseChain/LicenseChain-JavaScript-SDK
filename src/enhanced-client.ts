/**
 * Enhanced LicenseChain JavaScript SDK with advanced features
 * Comprehensive license management with enhanced functionality
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LicenseChainClient } from './client';
import { LicenseChainError, AuthenticationError, ValidationError } from './exceptions';
import { License, Application, User, AuthToken, WebhookEvent, LicenseVerificationResult } from './types';

export interface EnhancedClientConfig {
  appName: string;
  ownerId: string;
  appSecret: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export class EnhancedClient extends LicenseChainClient {
  private sessionId: string | null = null;
  private userData: User | null = null;
  private initialized: boolean = false;

  constructor(config: EnhancedClientConfig) {
    super(config.appName, config.ownerId, config.appSecret, config.baseUrl, config.timeout, config.retries);
  }

  /**
   * Initialize the client and establish connection
   */
  async init(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      const response = await this.makeRequest('init', {
        type: 'init',
        ver: '1.0',
        hash: this.generateHash(),
        enckey: this.generateEncryptionKey(),
        name: this.appName,
        ownerid: this.ownerId
      });

      if (response.success) {
        this.sessionId = response.sessionid;
        this.initialized = true;
        return true;
      }
      return false;
    } catch (error) {
      throw new LicenseChainError(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Login with license key only (advanced pattern)
   */
  async licenseLogin(licenseKey: string): Promise<{ success: boolean; info?: User; message?: string }> {
    this.ensureInitialized();

    const response = await this.makeRequest('license', {
      type: 'license',
      key: licenseKey,
      hwid: this.getHardwareId()
    });

    if (response.success) {
      this.userData = response.info;
      return response;
    } else {
      throw new LicenseChainError(response.message || 'License login failed');
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.userData !== null;
  }

  /**
   * Get current user data
   */
  getUserData(): User | null {
    return this.userData;
  }

  /**
   * Get user's subscription information
   */
  getSubscription(): string[] | null {
    if (!this.isLoggedIn()) {
      return null;
    }
    return this.userData?.subscriptions || null;
  }

  /**
   * Get user's variables
   */
  getVariables(): Record<string, string> | null {
    if (!this.isLoggedIn()) {
      return null;
    }
    return this.userData?.variables || null;
  }

  /**
   * Get user's data
   */
  getData(): Record<string, any> | null {
    if (!this.isLoggedIn()) {
      return null;
    }
    return this.userData?.data || null;
  }

  /**
   * Set user variable
   */
  async setVar(varName: string, data: string): Promise<boolean> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('setvar', {
      type: 'setvar',
      var: varName,
      data: data,
      sessionid: this.sessionId
    });

    return response.success || false;
  }

  /**
   * Get user variable
   */
  async getVar(varName: string): Promise<string | null> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('getvar', {
      type: 'getvar',
      var: varName,
      sessionid: this.sessionId
    });

    return response.success ? response.data : null;
  }

  /**
   * Log message to LicenseChain
   */
  async logMessage(message: string): Promise<boolean> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('log', {
      type: 'log',
      pcuser: this.getPcUser(),
      message: message,
      sessionid: this.sessionId
    });

    return response.success || false;
  }

  /**
   * Download file from LicenseChain
   */
  async downloadFile(fileId: string): Promise<string | null> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('file', {
      type: 'file',
      fileid: fileId,
      sessionid: this.sessionId
    });

    return response.success ? response.contents : null;
  }

  /**
   * Get application statistics
   */
  async getAppStats(): Promise<Record<string, any> | null> {
    this.ensureInitialized();

    const response = await this.makeRequest('app', {
      type: 'app',
      sessionid: this.sessionId
    });

    return response.success ? response : null;
  }

  /**
   * Get online users
   */
  async getOnlineUsers(): Promise<User[] | null> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('online', {
      type: 'online',
      sessionid: this.sessionId
    });

    return response.success ? response.users : null;
  }

  /**
   * Get chat messages
   */
  async chatGet(channel: string = 'general'): Promise<Record<string, any>[] | null> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('chatget', {
      type: 'chatget',
      channel: channel,
      sessionid: this.sessionId
    });

    return response.success ? response.messages : null;
  }

  /**
   * Send chat message
   */
  async chatSend(message: string, channel: string = 'general'): Promise<boolean> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('chatsend', {
      type: 'chatsend',
      message: message,
      channel: channel,
      sessionid: this.sessionId
    });

    return response.success || false;
  }

  /**
   * Ban user
   */
  async banUser(username: string): Promise<boolean> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('ban', {
      type: 'ban',
      user: username,
      sessionid: this.sessionId
    });

    return response.success || false;
  }

  /**
   * Unban user
   */
  async unbanUser(username: string): Promise<boolean> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('unban', {
      type: 'unban',
      user: username,
      sessionid: this.sessionId
    });

    return response.success || false;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[] | null> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('allusers', {
      type: 'allusers',
      sessionid: this.sessionId
    });

    return response.success ? response.users : null;
  }

  /**
   * Get user by username
   */
  async getUser(username: string): Promise<User | null> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('getuser', {
      type: 'getuser',
      user: username,
      sessionid: this.sessionId
    });

    return response.success ? response.info : null;
  }

  /**
   * Update user data
   */
  async updateUser(username: string, data: Record<string, any>): Promise<boolean> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('edituser', {
      type: 'edituser',
      user: username,
      data: data,
      sessionid: this.sessionId
    });

    return response.success || false;
  }

  /**
   * Delete user
   */
  async deleteUser(username: string): Promise<boolean> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('deleteuser', {
      type: 'deleteuser',
      user: username,
      sessionid: this.sessionId
    });

    return response.success || false;
  }

  /**
   * Get webhook data
   */
  async getWebhook(): Promise<Record<string, any> | null> {
    this.ensureLoggedIn();

    const response = await this.makeRequest('webhook', {
      type: 'webhook',
      sessionid: this.sessionId
    });

    return response.success ? response : null;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: string, signature: string): boolean {
    const expectedSignature = this.generateWebhookSignature(payload);
    return expectedSignature === signature;
  }

  /**
   * Parse webhook payload
   */
  parseWebhook(payload: string, signature: string): Record<string, any> | null {
    if (!this.verifyWebhook(payload, signature)) {
      return null;
    }

    try {
      return JSON.parse(payload);
    } catch (error) {
      return null;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<boolean> {
    if (!this.isLoggedIn()) {
      return true;
    }

    try {
      const response = await this.makeRequest('logout', {
        type: 'logout',
        sessionid: this.sessionId
      });

      if (response.success) {
        this.userData = null;
        this.sessionId = null;
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new LicenseChainError('Client not initialized. Call init() first.');
    }
  }

  private ensureLoggedIn(): void {
    this.ensureInitialized();
    if (!this.isLoggedIn()) {
      throw new LicenseChainError('User not logged in');
    }
  }

  private generateHash(): string {
    const data = `${this.appName}${this.ownerId}${this.appSecret}`;
    return this.sha256(data);
  }

  private generateEncryptionKey(): string {
    return this.generateRandomString(32);
  }

  private getHardwareId(): string {
    try {
      // Browser environment - use navigator properties
      if (typeof navigator !== 'undefined') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx?.fillText('LicenseChain', 2, 2);
        const fingerprint = canvas.toDataURL();
        
        return `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}-${fingerprint.slice(-20)}`;
      }
      
      // Node.js environment - use os module
      if (typeof require !== 'undefined') {
        const os = require('os');
        return `${os.hostname()}-${os.platform()}-${os.arch()}`;
      }
      
      return `unknown-hwid-${this.generateRandomString(8)}`;
    } catch (error) {
      return `unknown-hwid-${this.generateRandomString(8)}`;
    }
  }

  private getPcUser(): string {
    try {
      // Browser environment
      if (typeof navigator !== 'undefined') {
        return navigator.userAgent.split(' ')[0] || 'unknown';
      }
      
      // Node.js environment
      if (typeof require !== 'undefined') {
        const os = require('os');
        return os.userInfo().username || 'unknown';
      }
      
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  private generateWebhookSignature(payload: string): string {
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', this.appSecret)
      .update(payload)
      .digest('hex');
    return `sha256=${signature}`;
  }

  private sha256(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
