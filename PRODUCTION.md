# Production Deployment Guide

This guide covers deploying Ghost SDK to production environments.

## Pre-Deployment Checklist

- [ ] All tests pass: `npm test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Code coverage >80%: `npm run test:coverage`
- [ ] Build succeeds: `npm run build`
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated
- [ ] Version bump in package.json matches release version
- [ ] Git commits are clean and well-documented

## Version Management

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

### Bumping Version

```bash
# Update package.json version
npm version major|minor|patch

# This will:
# 1. Bump version in package.json
# 2. Create a git tag
# 3. Create a commit
```

## Publishing to npm

### Prerequisites

1. npm account with publish access
2. Two-factor authentication (2FA) enabled
3. `.npmrc` configured with auth token

### Automated Publishing (Recommended)

The GitHub Actions workflow automatically publishes on release:

```bash
# Create a release on GitHub
# This triggers the publish workflow which:
# 1. Runs all tests
# 2. Builds the package
# 3. Publishes to npm
```

### Manual Publishing

```bash
# Login to npm
npm login

# Build
npm run build

# Publish
npm publish

# Verify
npm view ghost-sdk versions
```

## Installation Verification

After publishing, verify installation works:

```bash
# Create a test directory
mkdir test-install
cd test-install
npm init -y

# Install the package
npm install ghost-sdk

# Create a test file
cat > test.js << 'EOF'
const { GhostSDK } = require('ghost-sdk');
const keyPair = GhostSDK.generateKeyPair();
console.log('✓ Installation successful!');
console.log('Generated key pair:', {
  privateKey: keyPair.privateKey.slice(0, 8) + '...',
  publicKey: keyPair.publicKey.slice(0, 8) + '...'
});
EOF

# Run test
node test.js

# Clean up
cd ..
rm -rf test-install
```

## Production Usage

### Best Practices

1. **Use exact versions in dependencies**
   ```json
   {
     "dependencies": {
       "ghost-sdk": "1.0.0"
     }
   }
   ```

2. **Keep SDK updated**
   ```bash
   npm outdated ghost-sdk
   npm update ghost-sdk
   ```

3. **Test after updates**
   ```bash
   npm test
   ```

4. **Monitor for security advisories**
   ```bash
   npm audit
   ```

### Integration Example

```typescript
import { GhostSDK } from 'ghost-sdk';

// Initialize
const keyPair = GhostSDK.generateKeyPair();

// Use in your application
const metaAddress = {
  spendingPublicKey: keyPair.publicKey,
  viewingPublicKey: GhostSDK.generateKeyPair().publicKey
};

// Generate stealth address
const payload = GhostSDK.generateStealthAddress(metaAddress);
```

## Monitoring

### Health Checks

Monitor your integration for:

1. **Functional Health**
   - Stealth address generation working
   - Payment scanning successful
   - Key derivation correct

2. **Performance**
   - generateStealthAddress: <15ms
   - isPaymentForRecipient: <30ms
   - deriveStealthPrivateKey: <15ms

3. **Security**
   - No exposed private keys in logs
   - Input validation working
   - Errors handled gracefully

## Rollback Procedures

If issues occur after deployment:

```bash
# Rollback to previous version
npm install ghost-sdk@<previous-version>

# Verify rollback
npm test
```

## Support and Security

- **Issues**: Open GitHub issue
- **Security**: Email security@example.com
- **Questions**: GitHub Discussions

## Maintenance

### Regular Tasks

- Monitor npm audit for vulnerabilities
- Review and merge security patches
- Keep dependencies updated
- Update documentation as needed

### Deprecation Policy

- Deprecated features will be marked with `@deprecated`
- Deprecation warnings appear in changelog
- At least one major version before removal
- Clear migration path provided
