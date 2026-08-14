# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Ghost SDK, please report it responsibly:

1. **Do NOT** create a public GitHub issue
2. Email security details to: security@example.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will acknowledge your report within 48 hours and work to resolve the issue.

## Supported Versions

| Version | Supported          |
|---------|------------------|
| 1.0.x   | ✅ Yes            |

## Security Best Practices

When using Ghost SDK:

1. **Private Key Management**
   - Never expose `spendingPrivateKey` or `viewingPrivateKey`
   - Store private keys securely (e.g., hardware wallets, encrypted vaults)
   - Use environment variables or secure key management systems

2. **View Tag Filtering**
   - View tags provide 99.6% false positive rejection
   - Always perform full address verification after view tag match
   - Don't rely solely on view tags for security decisions

3. **Input Validation**
   - All SDK functions validate inputs and throw on invalid parameters
   - Never bypass input validation

4. **Cryptographic Assumptions**
   - SDK assumes secp256k1 curve security
   - Relies on proven @noble/curves library
   - Uses industry-standard keccak256 hashing

## Dependencies

This SDK has minimal dependencies:
- `@noble/curves` - Audited cryptographic library
- `@noble/hashes` - Audited hashing library

Both are actively maintained and part of the widely-used @noble family of libraries.

## Cryptographic Review

The ERC-5564 stealth address specification has been reviewed by cryptographic experts. This implementation follows the specification exactly.

## Responsible Disclosure Timeline

- Day 0: Vulnerability reported
- Day 1: Acknowledgment sent
- Day 7: Initial assessment provided
- Day 30: Fix released (in urgent cases)
- Day 60: Non-urgent vulnerabilities patched

## Security Updates

We will release security updates as soon as vulnerabilities are discovered and fixed. Users should keep the SDK updated.

```bash
# Check for updates
npm outdated

# Update SDK
npm update ghost-sdk
```
