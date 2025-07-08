# Code Review Guidelines

## 🎯 Purpose

This document outlines the code review process and standards for the Fintan Virtual Care Hub project to ensure high-quality, maintainable, and secure code.

## 👥 Review Process

### Who Reviews?
- **All PRs** require at least **1 approval** from a team member
- **Critical changes** (security, database, deployment) require **2 approvals**
- **Breaking changes** require approval from a senior developer or maintainer

### Review Timeline
- **Standard PRs**: Review within 24 hours
- **Urgent fixes**: Review within 4 hours
- **Draft PRs**: No immediate review required

## 🔍 What to Review

### 1. Functionality
- [ ] Does the code do what it's supposed to do?
- [ ] Are edge cases handled properly?
- [ ] Is error handling comprehensive?
- [ ] Are user inputs validated?

### 2. Code Quality
- [ ] Is the code readable and well-structured?
- [ ] Are functions and variables named clearly?
- [ ] Is the code DRY (Don't Repeat Yourself)?
- [ ] Are functions focused on a single responsibility?
- [ ] Is the code properly commented where necessary?

### 3. Security
- [ ] No hardcoded secrets or credentials
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Authentication and authorization checks
- [ ] Sensitive data handling

### 4. Performance
- [ ] No obvious performance bottlenecks
- [ ] Database queries are optimized
- [ ] Unnecessary API calls avoided
- [ ] Bundle size impact considered
- [ ] Memory leaks prevented

### 5. Testing
- [ ] Adequate test coverage
- [ ] Tests are meaningful and test the right things
- [ ] Tests are maintainable
- [ ] Edge cases are tested

### 6. Documentation
- [ ] Code is self-documenting or well-commented
- [ ] API changes are documented
- [ ] README updated if necessary
- [ ] Breaking changes documented

## 📝 Review Comments

### Types of Comments

#### 🚨 **Must Fix** (Blocking)
Use for:
- Security vulnerabilities
- Bugs that break functionality
- Performance issues
- Code that doesn't follow critical standards

```markdown
🚨 **Must Fix**: This SQL query is vulnerable to injection attacks. Please use parameterized queries.
```

#### ⚠️ **Should Fix** (Strong Suggestion)
Use for:
- Code quality issues
- Maintainability concerns
- Best practice violations
- Performance optimizations

```markdown
⚠️ **Should Fix**: Consider extracting this logic into a separate function for better readability.
```

#### 💡 **Suggestion** (Optional)
Use for:
- Alternative approaches
- Minor improvements
- Learning opportunities
- Style preferences

```markdown
💡 **Suggestion**: You might consider using `useMemo` here for better performance.
```

#### ❓ **Question** (Clarification)
Use for:
- Understanding the approach
- Clarifying requirements
- Learning about decisions

```markdown
❓ **Question**: Why did you choose this approach over using the existing utility function?
```

#### 👍 **Praise** (Positive Feedback)
Use for:
- Good solutions
- Clean code
- Clever approaches
- Learning moments

```markdown
👍 **Great job**: This error handling is very thorough and user-friendly.
```

### Comment Guidelines

#### Be Constructive
- Focus on the code, not the person
- Explain the "why" behind your suggestions
- Offer solutions, not just problems
- Be specific about what needs to change

#### Be Clear
- Use clear, concise language
- Provide examples when helpful
- Link to documentation or standards
- Use code snippets to illustrate points

#### Be Respectful
- Assume positive intent
- Ask questions instead of making demands
- Acknowledge good work
- Be patient with learning opportunities

## 🏷️ Review Labels

### Priority Labels
- `priority: critical` - Security issues, production bugs
- `priority: high` - Important features, significant bugs
- `priority: medium` - Standard features, minor bugs
- `priority: low` - Nice-to-have features, cleanup

### Type Labels
- `type: feature` - New functionality
- `type: bugfix` - Bug fixes
- `type: refactor` - Code improvements
- `type: docs` - Documentation updates
- `type: test` - Test additions/improvements

### Status Labels
- `status: needs-review` - Ready for review
- `status: needs-changes` - Changes requested
- `status: approved` - Approved for merge
- `status: blocked` - Blocked by dependencies

## ✅ Approval Criteria

### Required for Approval
- [ ] All automated checks pass
- [ ] No blocking issues identified
- [ ] Security considerations addressed
- [ ] Performance impact acceptable
- [ ] Tests are adequate
- [ ] Documentation is sufficient

### Before Merging
- [ ] All review comments addressed
- [ ] CI/CD pipeline passes
- [ ] Branch is up to date
- [ ] No merge conflicts

## 🚀 Best Practices for Authors

### Before Requesting Review
- [ ] Self-review your code
- [ ] Run tests locally
- [ ] Check for console.log statements
- [ ] Ensure code follows style guidelines
- [ ] Write clear commit messages
- [ ] Fill out PR template completely

### During Review
- [ ] Respond to comments promptly
- [ ] Ask for clarification if needed
- [ ] Be open to feedback
- [ ] Make requested changes
- [ ] Re-request review after changes

### Communication
- [ ] Explain complex decisions in PR description
- [ ] Highlight areas that need special attention
- [ ] Mention any trade-offs made
- [ ] Document any known limitations

## 🔧 Tools and Automation

### Automated Checks
- **ESLint**: Code style and quality
- **TypeScript**: Type checking
- **Prettier**: Code formatting
- **Tests**: Unit and integration tests
- **Security**: Dependency scanning
- **Performance**: Bundle size analysis

### Manual Review Focus
Since automated tools handle style and basic issues, focus manual review on:
- Business logic correctness
- Architecture and design decisions
- Security implications
- User experience
- Edge cases and error handling

## 📚 Resources

### Internal Documentation
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Style Guide](../docs/STYLE_GUIDE.md)
- [Security Guidelines](../docs/SECURITY.md)
- [Testing Guidelines](../docs/TESTING.md)

### External Resources
- [Google's Code Review Guidelines](https://google.github.io/eng-practices/review/)
- [Best Practices for Code Review](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/)
- [The Art of Readable Code](https://www.oreilly.com/library/view/the-art-of/9781449318482/)

## 🤝 Conflict Resolution

### When Reviewers Disagree
1. Discuss in the PR comments
2. Escalate to team lead if needed
3. Consider pair programming session
4. Document decision for future reference

### When Author Disagrees
1. Explain your reasoning clearly
2. Be open to alternative viewpoints
3. Seek additional opinions if needed
4. Focus on project goals over personal preferences

---

Remember: Code review is a collaborative process aimed at improving code quality and sharing knowledge. Be kind, be thorough, and help each other grow! 🌱
