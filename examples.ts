/**
 * Comprehensive examples of Ghost SDK usage
 * These examples demonstrate all major features and patterns
 */

import { GhostSDK, isValidPublicKey, normalizeHex } from '../src';

/**
 * Example 1: Basic Setup - Recipient creates a Meta-Address
 */
function exampleBasicSetup(): void {
  console.log('=== Example 1: Basic Setup ===\n');

  // Recipient generates two key pairs
  const spendingKeyPair = GhostSDK.generateKeyPair();
  const viewingKeyPair = GhostSDK.generateKeyPair();

  console.log('Spending Key Pair:');
  console.log('  Private:', spendingKeyPair.privateKey);
  console.log('  Public:', spendingKeyPair.publicKey);

  console.log('\nViewing Key Pair:');
  console.log('  Private:', viewingKeyPair.privateKey);
  console.log('  Public:', viewingKeyPair.publicKey);

  // Create Meta-Address to share with senders
  const metaAddress = {
    spendingPublicKey: spendingKeyPair.publicKey,
    viewingPublicKey: viewingKeyPair.publicKey,
  };

  console.log('\nMeta-Address (share publicly):');
  console.log(JSON.stringify(metaAddress, null, 2));
}

/**
 * Example 2: Sender Creates Stealth Address
 */
function exampleSenderFlow(): void {
  console.log('\n=== Example 2: Sender Creates Stealth Address ===\n');

  // Sender has recipient's Meta-Address
  const recipientMeta = {
    spendingPublicKey: GhostSDK.generateKeyPair().publicKey,
    viewingPublicKey: GhostSDK.generateKeyPair().publicKey,
  };

  // Sender generates stealth address payload
  const payload = GhostSDK.generateStealthAddress(recipientMeta);

  console.log('Stealth Address Payload:');
  console.log(JSON.stringify(payload, null, 2));

  console.log('\nOn-chain data to publish:');
  console.log('  Event: Announcement');
  console.log('  - ephemeralPublicKey:', payload.ephemeralPublicKey);
  console.log('  - viewTag:', payload.viewTag);
  console.log('\nTransaction:');
  console.log('  - Send funds to:', payload.stealthAddress);
}

/**
 * Example 3: Recipient Scans for Payments
 */
function exampleRecipientScanning(): void {
  console.log('\n=== Example 3: Recipient Scans for Payments ===\n');

  // Setup: Create recipient keys
  const spendingKeyPair = GhostSDK.generateKeyPair();
  const viewingKeyPair = GhostSDK.generateKeyPair();

  // Create Meta-Address
  const metaAddress = {
    spendingPublicKey: spendingKeyPair.publicKey,
    viewingPublicKey: viewingKeyPair.publicKey,
  };

  // Sender creates stealth address for this recipient
  const stealthPayload = GhostSDK.generateStealthAddress(metaAddress);

  // Recipient scans blockchain for announcements
  const announcement = {
    ephemeralPublicKey: stealthPayload.ephemeralPublicKey,
    viewTag: stealthPayload.viewTag,
    stealthAddress: stealthPayload.stealthAddress,
  };

  console.log('Scanning announcement:');
  console.log(JSON.stringify(announcement, null, 2));

  // Check if this payment is for recipient
  const isForMe = GhostSDK.isPaymentForRecipient(
    viewingKeyPair.privateKey,
    spendingKeyPair.publicKey,
    announcement.ephemeralPublicKey,
    announcement.viewTag,
    announcement.stealthAddress
  );

  console.log('\nScan result:', isForMe ? '✓ Payment is for me!' : '✗ Not for me');
}

/**
 * Example 4: Recipient Derives Spending Key
 */
function exampleDeriveSpendingKey(): void {
  console.log('\n=== Example 4: Recipient Derives Spending Key ===\n');

  // Setup: Create recipient keys
  const spendingKeyPair = GhostSDK.generateKeyPair();
  const viewingKeyPair = GhostSDK.generateKeyPair();

  // Create Meta-Address and generate stealth address
  const metaAddress = {
    spendingPublicKey: spendingKeyPair.publicKey,
    viewingPublicKey: viewingKeyPair.publicKey,
  };

  const stealthPayload = GhostSDK.generateStealthAddress(metaAddress);

  // After scanning confirms this is a payment for recipient:
  const stealthPrivateKey = GhostSDK.deriveStealthPrivateKey(
    spendingKeyPair.privateKey,
    viewingKeyPair.privateKey,
    stealthPayload.ephemeralPublicKey
  );

  console.log('Derived Stealth Private Key:', stealthPrivateKey);
  console.log('\nThis key can be used to:');
  console.log('  - Sign transactions from the stealth address');
  console.log('  - Spend funds sent to:', stealthPayload.stealthAddress);
}

/**
 * Example 5: Complete End-to-End Flow
 */
function exampleEndToEnd(): void {
  console.log('\n=== Example 5: Complete End-to-End Flow ===\n');

  // Step 1: Recipient Setup
  console.log('Step 1: Recipient generates keys');
  const recipientSpending = GhostSDK.generateKeyPair();
  const recipientViewing = GhostSDK.generateKeyPair();

  const recipientMeta = {
    spendingPublicKey: recipientSpending.publicKey,
    viewingPublicKey: recipientViewing.publicKey,
  };
  console.log('✓ Meta-Address created\n');

  // Step 2: Sender generates stealth address
  console.log('Step 2: Sender generates stealth address');
  const payload = GhostSDK.generateStealthAddress(recipientMeta);
  console.log('✓ Stealth address:', payload.stealthAddress);
  console.log('✓ View tag:', payload.viewTag, '\n');

  // Step 3: Sender sends funds to stealth address and publishes announcement
  console.log('Step 3: Sender sends funds and publishes announcement');
  console.log('✓ Funds sent to:', payload.stealthAddress);
  console.log('✓ Event published\n');

  // Step 4: Recipient scans announcements
  console.log('Step 4: Recipient scans for payments');
  const isForMe = GhostSDK.isPaymentForRecipient(
    recipientViewing.privateKey,
    recipientSpending.publicKey,
    payload.ephemeralPublicKey,
    payload.viewTag,
    payload.stealthAddress
  );
  console.log('✓ Payment detected:', isForMe ? 'YES' : 'NO', '\n');

  // Step 5: Recipient derives spending key
  if (isForMe) {
    console.log('Step 5: Recipient derives stealth private key');
    const stealthPrivateKey = GhostSDK.deriveStealthPrivateKey(
      recipientSpending.privateKey,
      recipientViewing.privateKey,
      payload.ephemeralPublicKey
    );
    console.log('✓ Stealth private key derived');
    console.log('✓ Ready to spend from:', payload.stealthAddress);
  }
}

/**
 * Example 6: Error Handling
 */
function exampleErrorHandling(): void {
  console.log('\n=== Example 6: Error Handling ===\n');

  try {
    console.log('Attempting invalid operation...');
    const invalidMeta = {
      spendingPublicKey: 'invalid',
      viewingPublicKey: 'also_invalid',
    };
    GhostSDK.generateStealthAddress(invalidMeta);
  } catch (error) {
    console.log('✓ Caught error:', (error as Error).message);
  }

  console.log();

  try {
    console.log('Attempting invalid private key...');
    GhostSDK.getPublicKey('not_a_valid_key');
  } catch (error) {
    console.log('✓ Caught error:', (error as Error).message);
  }
}

/**
 * Example 7: Utility Functions
 */
function exampleUtilityFunctions(): void {
  console.log('\n=== Example 7: Utility Functions ===\n');

  const testKey = GhostSDK.generateKeyPair().publicKey;

  console.log('Generated key:', testKey);
  console.log('Is valid public key:', isValidPublicKey(testKey));
  console.log('Normalized (remove 0x):', normalizeHex(testKey));
}

/**
 * Example 8: Multiple Payments Scanning
 */
function exampleMultiplePaymentScanning(): void {
  console.log('\n=== Example 8: Scanning Multiple Payments ===\n');

  // Setup recipient
  const spendingKeyPair = GhostSDK.generateKeyPair();
  const viewingKeyPair = GhostSDK.generateKeyPair();

  const metaAddress = {
    spendingPublicKey: spendingKeyPair.publicKey,
    viewingPublicKey: viewingKeyPair.publicKey,
  };

  // Simulate 10 announcements from blockchain
  const announcements = [];
  for (let i = 0; i < 10; i++) {
    announcements.push(GhostSDK.generateStealthAddress(metaAddress));
  }

  console.log(`Scanning ${announcements.length} announcements...\n`);

  let paymentCount = 0;
  announcements.forEach((announcement, index) => {
    const isForMe = GhostSDK.isPaymentForRecipient(
      viewingKeyPair.privateKey,
      spendingKeyPair.publicKey,
      announcement.ephemeralPublicKey,
      announcement.viewTag,
      announcement.stealthAddress
    );

    if (isForMe) {
      paymentCount++;
      console.log(`✓ Payment ${index + 1}: Found a payment for me!`);
    }
  });

  console.log(`\nTotal payments for this recipient: ${paymentCount}`);
}

// Run all examples
if (require.main === module) {
  exampleBasicSetup();
  exampleSenderFlow();
  exampleRecipientScanning();
  exampleDeriveSpendingKey();
  exampleEndToEnd();
  exampleErrorHandling();
  exampleUtilityFunctions();
  exampleMultiplePaymentScanning();

  console.log('\n=== All examples completed ===\n');
}
