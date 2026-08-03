import { LicenseChainClient } from '../src/client';
import { WebhookHandler, WebhookEvents } from '../src/webhook-handler';
import { 
  validateEmail, 
  validateLicenseKey, 
  generateLicenseKey, 
  generateUuid,
  formatBytes, 
  formatDuration, 
  capitalizeFirst, 
  toSnakeCase, 
  toPascalCase,
  slugify,
  jsonSerialize
} from '../src/utils';

// Configure the SDK
const client = LicenseChainClient.create('your-api-key-here', 'https://api.licensechain.app');

async function basicUsageExample() {
  console.log('🚀 LicenseChain JavaScript SDK - Basic Usage Example\n');

  try {
    // 1. License Management
    console.log('🔑 License Management:');
    
    // Create a license
    const metadata = {
      platform: 'javascript',
      version: '1.0.0',
      features: ['validation', 'webhooks']
    };
    
    const license = await client.getLicenses().create({
      app_id: 'app_123',
      issued_email: 'buyer@example.com',
      metadata
    });
    console.log(`✅ License created: ${license.id}`);
    console.log(`   License Key: ${license.license_key}`);
    console.log(`   Status: ${license.status}`);
    
    // Validate a license
    const licenseKey = generateLicenseKey();
    console.log(`\n🔍 Validating license key: ${licenseKey}`);
    
    const isValid = await client.getLicenses().validate(licenseKey);
    if (isValid) {
      console.log('✅ License is valid');
    } else {
      console.log('❌ License is invalid');
    }
    
    // Get license stats
    const stats = await client.getLicenses().stats();
    console.log('\n📊 License Statistics:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Active: ${stats.active}`);
    console.log(`   Expired: ${stats.expired}`);
    console.log(`   Revenue: $${stats.revenue}`);
    
    // 2. User Management
    console.log('\n👤 User Management:');
    
    // Create a user
    const userMetadata = {
      source: 'javascript-sdk',
      plan: 'premium'
    };
    
    const user = await client.getUsers().create({
      email: 'user@example.com',
      name: 'John Doe',
      metadata: userMetadata
    });
    console.log(`✅ User created: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    
    // Get user stats
    const userStats = await client.getUsers().stats();
    console.log('\n📊 User Statistics:');
    console.log(`   Total: ${userStats.total}`);
    console.log(`   Active: ${userStats.active}`);
    console.log(`   Inactive: ${userStats.inactive}`);
    
    // 3. Product Management
    console.log('\n📦 Product Management:');
    console.log('ℹ️ Product endpoints are not available in the current API v1 surface.');
    
    // 4. Webhook Management
    console.log('\n🔗 Webhook Management:');
    
    // Create a webhook
    const events = [
      'license.created',
      'license.updated',
      'user.created'
    ];
    
    const webhook = await client.getWebhooks().create({
      url: 'https://example.com/webhook',
      events,
      secret: 'webhook-secret'
    });
    console.log(`✅ Webhook created: ${webhook.id}`);
    console.log(`   URL: ${webhook.url}`);
    console.log(`   Events: ${webhook.events.join(', ')}`);
    
    // 5. Webhook Processing
    console.log('\n🔄 Webhook Processing:');
    
    const webhookHandler = new WebhookHandler('webhook-secret');
    
    // Simulate a webhook event
    const webhookEvent = {
      id: 'evt_123',
      type: 'license.created',
      data: {
        id: 'lic_123',
        user_id: 'user_123',
        product_id: 'prod_123',
        license_key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ012345',
        status: 'active',
        created_at: '2023-01-01T00:00:00Z'
      },
      timestamp: '2023-01-01T00:00:00Z',
      signature: 'signature_here'
    };
    
    webhookHandler.processEvent(webhookEvent);
    console.log('✅ Webhook event processed successfully');
    
    // 6. Utility Functions
    console.log('\n🛠️ Utility Functions:');
    
    // Email validation
    const email = 'test@example.com';
    console.log(`Email '${email}' is valid: ${validateEmail(email)}`);
    
    // License key validation
    const licenseKey = generateLicenseKey();
    console.log(`License key '${licenseKey}' is valid: ${validateLicenseKey(licenseKey)}`);
    
    // Generate UUID
    const uuid = generateUuid();
    console.log(`Generated UUID: ${uuid}`);
    
    // Format bytes
    const bytes = 1024 * 1024;
    console.log(`${bytes} bytes = ${formatBytes(bytes)}`);
    
    // Format duration
    const seconds = 3661;
    console.log(`Duration: ${formatDuration(seconds)}`);
    
    // String utilities
    const text = 'Hello World';
    console.log(`Capitalize first: ${capitalizeFirst(text)}`);
    console.log(`To snake_case: ${toSnakeCase('HelloWorld')}`);
    console.log(`To PascalCase: ${toPascalCase('hello_world')}`);
    console.log(`Slugify: ${slugify('Hello World!')}`);
    
    // 7. Error Handling
    console.log('\n🛡️ Error Handling:');
    
    try {
      await client.getLicenses().get('invalid-id');
    } catch (error) {
      console.log(`✅ Caught expected error: ${error}`);
    }
    
    try {
      await client.getUsers().create({
        email: 'invalid-email',
        name: 'John Doe'
      });
    } catch (error) {
      console.log(`✅ Caught expected error: ${error}`);
    }
    
    // 8. API Health Check
    console.log('\n🏥 API Health Check:');
    
    const ping = await client.ping();
    console.log(`Ping response: ${jsonSerialize(ping)}`);
    
    const health = await client.health();
    console.log(`Health response: ${jsonSerialize(health)}`);
    
    console.log('\n✅ Basic usage example completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (process.env.DEBUG) {
      console.error('Stack trace:', error);
    }
  }
}

// Run the example
if (require.main === module) {
  basicUsageExample();
}

export { basicUsageExample };
