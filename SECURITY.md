# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email (Preferred):** Send an email to the maintainer
   - Include "SECURITY" in the subject line
   - Provide a detailed description of the vulnerability
   - Include steps to reproduce (if applicable)
   - Suggest a fix (if you have one)

2. **GitHub Security Advisory (if enabled):** Use GitHub's private vulnerability reporting feature if available

### What to Include in Your Report

To help us understand and address the issue, please include:

- **Type of vulnerability** (e.g., XSS, CSRF, authentication bypass, data exposure)
- **Affected component** (e.g., API route, component, configuration)
- **Steps to reproduce** the vulnerability
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Proof of concept** (if applicable, but please be responsible)

### Response Timeline

We will make every effort to:

- **Acknowledge** your report within 48 hours
- **Provide an initial assessment** within 7 days
- **Keep you informed** of our progress
- **Resolve critical vulnerabilities** as quickly as possible (typically within 30 days)

### Disclosure Policy

- We will work with you to understand and resolve the issue quickly
- We will credit you for the discovery (if you wish)
- We will not disclose the vulnerability publicly until a fix is available
- We will coordinate with you on the disclosure timeline

## Security Best Practices

### For Users

When deploying this application:

1. **Environment Variables:**
   - Never commit `.env.local` or any file containing credentials
   - Use strong, unique AWS access keys
   - Rotate credentials regularly
   - Prefer IAM roles over access keys when possible (especially on EC2)

2. **AWS Configuration:**
   - Follow the principle of least privilege for IAM permissions
   - Enable AWS CloudTrail for audit logging
   - Use VPC and security groups to restrict network access
   - Keep AWS SDK and dependencies up to date
   - Ensure Bedrock model access is properly configured

3. **Application Security:**
   - Keep dependencies updated (`npm audit` regularly)
   - Use HTTPS in production
   - Review and apply security headers (already configured in `next.config.js`)
   - Regularly review and update AWS Bedrock model access permissions

4. **Deployment:**
   - Use secure deployment practices (see README.md Deployment section)
   - Enable automatic security updates on your server
   - Use firewall rules to restrict access
   - Monitor application logs for suspicious activity

5. **Data Privacy:**
   - SSN handling: Never store SSNs in the database
   - SSNs are entered at PDF generation time only
   - Follow federal data privacy regulations (if applicable)

### For Contributors

- Never commit credentials, API keys, or secrets
- Review security implications of new features
- Follow secure coding practices
- Keep dependencies updated
- Test security-related changes thoroughly
- Be mindful of data privacy requirements

## Known Security Considerations

### AWS Credentials

- **Server-Side Only:** All AWS credentials are kept server-side and never exposed to the browser
- **Environment Variables:** Sensitive variables use no `NEXT_PUBLIC_` prefix
- **Validation:** Environment variables are validated at runtime
- **IAM Roles:** The application supports IAM roles for more secure credential management

### Input Validation

- **Zod Schema Validation**: All API inputs are validated using Zod schemas for type safety and security
- **Input Limits**: 
  - Scenario descriptions: Maximum 5,000 characters (prevents DoS attacks)
  - Chat messages: Maximum 2,000 characters per message
  - Conversation history: Maximum 50 messages per conversation
- **Structure Validation**: 
  - Conversation history messages must have valid `role` ("user" or "assistant") and `content` (non-empty string)
  - All inputs are trimmed and validated before processing
- **Type Safety**: TypeScript types are automatically inferred from Zod schemas
- **Error Handling**: Validation errors return structured error messages with field-level details
- **Client and Server Validation**: Inputs are validated on both client and server for defense in depth
- **Sanitization**: All string inputs are trimmed before being sent to AWS Bedrock

### API Security

- **Server-Side Execution**: API routes run server-side only
- **Input Validation**: All requests are validated with Zod before processing:
  - Prevents injection attacks
  - Protects against DoS via oversized payloads
  - Ensures data type correctness
  - Validates conversation history structure
- **Error Handling**: Proper error handling without exposing internal details
- **Security Headers**: Security headers configured (HSTS, X-Frame-Options, etc.)
- **No Sensitive Data Exposure**: No sensitive data exposed in client-side code

### PDF Generation

- PDF generation happens client-side using @react-pdf/renderer
- No sensitive data sent to external PDF services
- SSN placeholder shown in PDF (actual SSN entered at generation time)

## Security Updates

Security updates will be:

- Released as patch versions (e.g., 0.1.1, 0.1.2)
- Documented in the CHANGELOG.md
- Tagged with security-related labels
- Communicated through GitHub releases

## Dependencies

We regularly update dependencies to address security vulnerabilities:

- Run `npm audit` to check for known vulnerabilities
- Review and update dependencies regularly
- Monitor security advisories for our dependencies
- Use `npm audit fix` when safe to do so

## Questions?

If you have questions about security that are not related to vulnerabilities, please:

- Open a GitHub Discussion
- Create a regular GitHub Issue
- Contact the maintainer

---

**Thank you for helping keep this project secure!**

