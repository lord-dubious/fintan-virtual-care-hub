# Repository Settings Configuration

This document outlines the recommended GitHub repository settings for the Fintan Virtual Care Hub project to ensure proper PR review processes and code quality.

## 🔒 Branch Protection Rules

### Main Branch Protection
Configure the following settings for the `main` branch:

#### Required Status Checks
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required checks:
  - `CI / test (18.x)`
  - `CI / test (20.x)`
  - `CI / lighthouse`
  - `CI / security`
  - `PR Review Checks / validate`
  - `PR Review Checks / code-quality`
  - `PR Review Checks / security`
  - `PR Review Checks / test`
  - `PR Review Checks / build`

#### Pull Request Requirements
- ✅ Require a pull request before merging
- ✅ Require approvals: **1** (minimum)
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require review from code owners (if CODEOWNERS file exists)
- ✅ Restrict pushes that create files that match a pattern: `*.env*`, `*.key`, `*.pem`

#### Additional Restrictions
- ✅ Restrict pushes to matching branches
- ✅ Allow force pushes: **Disabled**
- ✅ Allow deletions: **Disabled**

### Develop Branch Protection
Configure similar settings for the `develop` branch with slightly relaxed requirements:

#### Required Status Checks
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required checks:
  - `CI / test (20.x)` (only latest Node.js version)
  - `PR Review Checks / validate`
  - `PR Review Checks / code-quality`
  - `PR Review Checks / build`

#### Pull Request Requirements
- ✅ Require a pull request before merging
- ✅ Require approvals: **1**
- ✅ Dismiss stale PR approvals when new commits are pushed

## 🏷️ Repository Labels

### Type Labels
```yaml
- name: "type: feature"
  color: "0e8a16"
  description: "New feature or enhancement"

- name: "type: bug"
  color: "d73a4a"
  description: "Bug fix"

- name: "type: docs"
  color: "0075ca"
  description: "Documentation changes"

- name: "type: refactor"
  color: "fbca04"
  description: "Code refactoring"

- name: "type: test"
  color: "1d76db"
  description: "Test additions or improvements"

- name: "type: chore"
  color: "fef2c0"
  description: "Maintenance tasks"

- name: "type: security"
  color: "b60205"
  description: "Security-related changes"

- name: "type: performance"
  color: "5319e7"
  description: "Performance improvements"

- name: "type: dependencies"
  color: "0366d6"
  description: "Dependency updates"

- name: "type: ci"
  color: "28a745"
  description: "CI/CD changes"
```

### Priority Labels
```yaml
- name: "priority: critical"
  color: "b60205"
  description: "Critical priority"

- name: "priority: high"
  color: "d93f0b"
  description: "High priority"

- name: "priority: medium"
  color: "fbca04"
  description: "Medium priority"

- name: "priority: low"
  color: "0e8a16"
  description: "Low priority"
```

### Status Labels
```yaml
- name: "status: needs-triage"
  color: "ededed"
  description: "Needs initial review and categorization"

- name: "status: needs-review"
  color: "fbca04"
  description: "Ready for review"

- name: "status: needs-changes"
  color: "d93f0b"
  description: "Changes requested"

- name: "status: approved"
  color: "0e8a16"
  description: "Approved for merge"

- name: "status: blocked"
  color: "b60205"
  description: "Blocked by dependencies"

- name: "status: wip"
  color: "fef2c0"
  description: "Work in progress"
```

### Component Labels
```yaml
- name: "component: frontend"
  color: "1d76db"
  description: "Frontend changes"

- name: "component: backend"
  color: "0052cc"
  description: "Backend changes"

- name: "component: database"
  color: "5319e7"
  description: "Database changes"

- name: "component: api"
  color: "0366d6"
  description: "API changes"

- name: "component: ui"
  color: "f9d0c4"
  description: "UI/UX changes"

- name: "component: auth"
  color: "d4c5f9"
  description: "Authentication/authorization"

- name: "component: payments"
  color: "c2e0c6"
  description: "Payment system"

- name: "component: booking"
  color: "bfdadc"
  description: "Booking system"

- name: "component: video"
  color: "fad8c7"
  description: "Video calling"

- name: "component: messaging"
  color: "d1ecf1"
  description: "Messaging system"
```

## 🔧 Repository Settings

### General Settings
- ✅ **Issues**: Enabled
- ✅ **Projects**: Enabled
- ✅ **Wiki**: Disabled (use docs/ folder instead)
- ✅ **Discussions**: Enabled
- ✅ **Sponsorships**: Disabled

### Pull Requests
- ✅ **Allow merge commits**: Enabled
- ✅ **Allow squash merging**: Enabled (default)
- ✅ **Allow rebase merging**: Enabled
- ✅ **Always suggest updating pull request branches**: Enabled
- ✅ **Allow auto-merge**: Enabled
- ✅ **Automatically delete head branches**: Enabled

### Security & Analysis
- ✅ **Dependency graph**: Enabled
- ✅ **Dependabot alerts**: Enabled
- ✅ **Dependabot security updates**: Enabled
- ✅ **Dependabot version updates**: Enabled (configured via dependabot.yml)
- ✅ **Code scanning**: Enabled
- ✅ **Secret scanning**: Enabled
- ✅ **Secret scanning push protection**: Enabled

## 👥 Team Permissions

### Repository Roles
- **Admin**: @lord-dubious
- **Maintain**: Core team members
- **Write**: Regular contributors
- **Triage**: Community moderators
- **Read**: All team members

### Code Owners
Create a `.github/CODEOWNERS` file:

```
# Global owners
* @lord-dubious

# Frontend
/src/ @lord-dubious
/public/ @lord-dubious
package.json @lord-dubious
vite.config.ts @lord-dubious

# Backend
/backend/ @lord-dubious
/backend/src/ @lord-dubious
/backend/package.json @lord-dubious

# Database
/backend/prisma/ @lord-dubious
*.sql @lord-dubious

# CI/CD
/.github/ @lord-dubious
/.github/workflows/ @lord-dubious

# Documentation
/docs/ @lord-dubious
*.md @lord-dubious

# Security
/.github/workflows/security.yml @lord-dubious
/.github/workflows/pr-review.yml @lord-dubious
```

## 🔔 Notifications

### Recommended Notification Settings
- ✅ **Issues**: Watch
- ✅ **Pull Requests**: Watch
- ✅ **Releases**: Watch
- ✅ **Discussions**: Participating
- ✅ **Security Alerts**: Watch

### Webhook Configuration
Configure webhooks for:
- Slack/Discord notifications
- Deployment triggers
- Monitoring alerts

## 📊 Insights & Analytics

### Recommended Insights
- ✅ **Pulse**: Monitor activity
- ✅ **Contributors**: Track contributions
- ✅ **Community**: Monitor community health
- ✅ **Traffic**: Monitor repository traffic
- ✅ **Commits**: Track commit activity
- ✅ **Code frequency**: Monitor code changes
- ✅ **Dependency graph**: Monitor dependencies
- ✅ **Network**: Visualize repository network

## 🚀 Automation

### GitHub Actions Permissions
- ✅ **Actions permissions**: Allow all actions and reusable workflows
- ✅ **Workflow permissions**: Read and write permissions
- ✅ **Allow GitHub Actions to create and approve pull requests**: Enabled

### Environment Protection Rules
For production deployments:
- ✅ **Required reviewers**: 1
- ✅ **Wait timer**: 0 minutes
- ✅ **Deployment branches**: Selected branches (main only)

## 📋 Setup Checklist

To configure these settings:

1. **Branch Protection**:
   - Go to Settings → Branches
   - Add rules for `main` and `develop` branches
   - Configure required status checks

2. **Labels**:
   - Go to Issues → Labels
   - Create the labels listed above
   - Delete default labels that aren't needed

3. **Security**:
   - Go to Settings → Security & analysis
   - Enable all recommended security features

4. **Collaborators**:
   - Go to Settings → Manage access
   - Add team members with appropriate roles

5. **Code Owners**:
   - Create `.github/CODEOWNERS` file
   - Add code ownership rules

6. **Webhooks** (if needed):
   - Go to Settings → Webhooks
   - Configure external integrations

This configuration ensures a robust PR review process with proper quality gates and security measures.
