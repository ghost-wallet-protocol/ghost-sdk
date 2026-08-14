# Contributing to Ghost SDK

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd ghost-sdk

# Install dependencies
npm install

# Start development mode
npm run dev
```

## Making Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure code quality:
   ```bash
   # Format code
   npm run format

   # Check types
   npm run type-check

   # Lint code
   npm run lint

   # Run tests
   npm test
   ```

3. Write or update tests for your changes. All new code must maintain >80% coverage.

4. Build the project:
   ```bash
   npm run build
   ```

## Code Standards

- **TypeScript**: Strict mode enabled. No `any` types without explicit justification.
- **Testing**: All functions must have test coverage.
- **Documentation**: Add JSDoc comments to public APIs.
- **Formatting**: Use Prettier (run `npm run format`).

## Testing Requirements

- All new features must include tests
- All bug fixes must include tests that verify the fix
- Run `npm test` before submitting changes
- Maintain >80% code coverage

## Commit Guidelines

- Use clear, descriptive commit messages
- Reference related issues in commit messages
- Keep commits focused on a single concern

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure code is formatted: `npm run format`
3. Ensure no linting errors: `npm run lint`
4. Provide a clear description of changes
5. Link to related issues if applicable

## Reporting Issues

- Use clear, descriptive titles
- Include steps to reproduce for bugs
- Include expected vs actual behavior
- Provide environment details (Node version, OS, etc.)

## Security

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
