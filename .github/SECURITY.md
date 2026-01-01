# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of PARA Method Obsidian Agent seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue
- Discuss the vulnerability publicly
- Share the vulnerability with others until it has been resolved

### Please DO:

1. **Email the maintainers** or create a private security advisory:
   - Open a [GitHub Security Advisory](https://github.com/shivam-g10/para-method-bot/security/advisories/new)
   - Or contact the maintainers directly if you prefer

2. **Include the following information:**
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Suggested fix (if you have one)

3. **Allow time for response:**
   - We will acknowledge receipt within 48 hours
   - We will provide an initial assessment within 7 days
   - We will keep you informed of our progress

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Assessment**: We will assess the vulnerability and determine its severity
- **Fix**: We will work on a fix and keep you informed of progress
- **Disclosure**: We will coordinate disclosure with you after a fix is available

### Security Best Practices

When using PARA Method Obsidian Agent:

- **Keep the plugin updated** to the latest version
- **Use secure storage** for API keys (the plugin uses OS-level secure storage)
- **Review permissions** granted to the plugin
- **Report suspicious behavior** immediately

### Known Security Considerations

- API keys are stored using Electron's `safeStorage` API (OS-level encryption)
- Secrets are never logged or stored in plain text
- Local LLM support (Ollama) allows complete privacy - no data leaves your machine
- MCP integration requires explicit vault access permissions

### Security Updates

Security updates will be released as patches to the current version. We recommend:

- Enabling automatic updates in Obsidian (if available)
- Regularly checking for plugin updates
- Reviewing release notes for security-related changes

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the issue and determine affected versions
2. Audit code to find any potential similar problems
3. Prepare fixes for all releases still under maintenance
4. Publish a security advisory and release the fixes

We credit security researchers who responsibly disclose vulnerabilities. If you would like to be credited, please let us know how you would like to be credited.

Thank you for helping keep PARA Method Obsidian Agent and its users safe!

