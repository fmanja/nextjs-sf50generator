# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-04

### Added
- Initial release of AI SF-50 Assistant
- AI-powered NOA (Nature of Action) code recommendations using AWS Bedrock with Claude 3.5/3.7 Sonnet
- Next.js 14 application with TypeScript support
- Interactive chatbot for follow-up questions and recommendation refinement
- PDF generation for SF-50 forms with pre-filled employee and recommendation data
- Employee selection from sample directory (25 employees)
- Natural language scenario input for personnel actions
- Real-time recommendation updates based on chatbot conversations
- Support for multiple NOA codes and Legal Authority Codes (LAC)
- Comprehensive prompt engineering for accurate AI recommendations
- Client-side PDF viewing and download functionality
- Effective date selection for personnel actions
- Responsive design with Tailwind CSS and shadcn/ui components
- Server-side API routes for secure AWS Bedrock integration
- Environment variable validation and configuration
- Support for AWS inference profiles (Claude 3.7+)
- Comprehensive error handling for AWS Bedrock API
- Type-safe API request/response handling
- Security headers configuration in Next.js
- Production-ready build configuration
- Comprehensive documentation:
  - README.md with setup and deployment instructions
  - CONTRIBUTING.md with contribution guidelines
  - CODE_OF_CONDUCT.md with community standards
  - SECURITY.md with security policy
  - OPEN_SOURCE_CHECKLIST.md for open source preparation
- Open source preparation:
  - Apache 2.0 license
  - NOTICE file with attribution
  - Comprehensive .gitignore configuration
  - Security best practices documentation
  - Initial GitHub repository setup

### Security
- All AWS credentials kept server-side only (no NEXT_PUBLIC_ prefix)
- Environment variables properly gitignored
- No hardcoded credentials or API keys
- Secure API route implementation
- Input validation on both client and server side
- Type-safe error handling
- SSN handling: entered at generation time, never stored

### Technical Details
- Next.js 14 App Router architecture
- TypeScript throughout the application
- AWS Bedrock integration with Claude models
- PDF generation using @react-pdf/renderer
- Client-side state management with React hooks
- Dynamic imports for ESM packages
- Proper handling of inference profiles for newer Claude models

### Fixed
- Resolved ESM package import issues with @react-pdf/renderer
- Fixed Next.js configuration for PDF library transpilation
- Improved error handling and user-friendly error messages
- Enhanced type safety throughout the application

---

## [Unreleased]

### Planned
- Additional NOA code support
- Enhanced PDF customization options
- Export functionality (DOCX, JSON)
- Recommendation history/saving
- User authentication (optional)
- Multi-language support
- Enhanced chatbot capabilities
- Integration with additional AWS services
- Test suite and CI/CD workflows

---

[0.1.0]: https://github.com/fmanja/nextjs-sf50generator/releases/tag/v0.1.0

