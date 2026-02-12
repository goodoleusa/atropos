# Project Architect Reference

## Evaluation Metrics Deep Dive

### Quantitative Scoring System

**Project Structure (40% of total score)**
- **Directory Organization (10 points)**: Clear naming conventions, logical grouping
- **Configuration Management (10 points)**: Proper env handling, version control
- **Documentation Standards (10 points)**: README completeness, inline docs
- **Tooling Setup (10 points)**: Linting, formatting, build tools configured

**Code Quality Assessment (35% of total score)**
- **Functionality (8.75 points)**: Core features working as intended
- **Error Handling (8.75 points)**: Graceful failure, user-friendly errors
- **Performance (8.75 points)**: Response times, resource usage
- **Maintainability (8.75 points)**: Code clarity, modularity

**Production Readiness (25% of total score)**
- **Testing Coverage (8.33 points)**: Unit, integration, E2E tests
- **Deployment Process (8.33 points)**: CI/CD, environment parity
- **Monitoring (8.33 points)**: Logging, alerting, observability

### Cost-Effective AI Integration Matrix

| Feature Type | Free Model Options | Implementation Effort | Best Use Cases |
|-------------|-------------------|----------------------|----------------|
| Text Processing | Llama 2 13B, Mistral 7B | Low-Medium | Chat, summarization |
| Code Generation | Codellama, StarCoder | Medium | Assistant features |
| Data Analysis | GPT-3.5 (free tier), Claude Haiku | Low | Reports, insights |
| Image Processing | Stable Diffusion (local) | High | Creative features |
| Audio Processing | Whisper (local) | Medium | Transcription |

## Debugging Workflows by Technology Stack

### Web Application Debugging

**Frontend Issues Checklist:**
```
□ Browser compatibility issues (check different browsers)
□ Mobile responsive layout problems
□ Console Javascript errors
□ CSS specificity conflicts
□ State management inconsistencies
□ API integration failures
□ Build tool configuration errors
□ Dependency version conflicts
```

**Backend Issues Checklist:**
```
□ Database connection failures
□ Authentication system errors
□ Rate limiting issues
□ Memory leaks detection
□ API response debugging
□ Environment variable issues
□ Server configuration problems
□ Third-party service outages
```

### Mobile App Debugging

**Common Pattern Analysis:**
1. **Performance Issues**
   - Memory profiling using dev tools
   - CPU usage monitoring
   - Network request optimization
   - Battery drain investigation

2. **UI/UX Problems**
   - Screen size adaptation
   - Touch gesture recognition
   - Animation performance
   - Accessibility compliance

3. **Platform-Specific Issues**
   - iOS vs Android behavioral differences
   - Native module integration failures
   - App store rejection patterns
   - Device-specific crashes

## Feature Ideation Framework

### User Journey Analysis

Map each user interaction point and identify friction:

1. **Discovery Phase**
   - How users find your product
   - Onboarding experience quality
   - Feature visibility and accessibility

2. **Engagement Phase**
   - Core task completion speed
   - User satisfaction metrics
   - Feature adoption rates

3. **Retention Phase**
   - Return user frequency
   - Feature usage patterns
   - Churn reduction opportunities

### Market Gap Analysis

Research competitor landscapes:

```markdown
Analysis Method:
1. List top 3-5 competitors
2. Map their feature sets
3. Identify user complaints/requests
4. Spot missing functionality
5. Evaluate implementation feasibility
6. Prioritize based on user impact
```

## Resource Optimization Strategies

### Free AI Models Performance Comparison

**Text Generation Models:**
- **Llama 2 7B**: Good for basic text tasks, ~2GB RAM
- **Llama 2 13B**: Better reasoning, ~4GB RAM required  
- **Mistral 7B**: Excellent coding, ~4GB RAM needed

**Code Models:**
- **CodeLlama 7B**: Basic programming help, ~4GB RAM
- **StarCoder**: Multi-language support, ~8GB RAM

**Specialized Models:**
- **Whisper**: Free speech-to-text, ~1GB RAM
- **Stable Diffusion**: Text-to-image, ~4GB VRAM minimum

### Implementation Cost Calculator

Estimate resource requirements:

```python
# Example calculation for text processing
requests_per_month = 10000
model_size_gb = 4  # Llama 2 13B
memory_usage_gb = 8 # RAM needed

# Cloud hosting costs (approximate)
if local_deployment:
    hosting_cost = 0  # Use existing infrastructure
else:
    hosting_cost = 50  # DigitalOcean droplet per month

ai_api_costs_per_1k_tokens = 0.001  # Using free tier limits
monthly_ai_cost = (requests_per_month * 0.1) * ai_api_costs_per_1k_tokens
total_monthly_cost = hosting_cost + monthly_ai_cost
```

## Documentation Templates

### Architecture Decision Records (ADRs)

```markdown
# ADR-001: [Decision Title]

## Status
Accepted | Rejected | Superseded | Deprecated

## Context
Brief description of the problem we're solving

## Decision
What we decided to do

## Consequences
- Positive effects
- Negative effects
- Trade-offs made

## Alternatives Considered
Brief list of other options evaluated
```

### Technical Debt Register

```markdown
# Technical Debt Tracker

## High Priority (Fix in Next Sprint)
- [ ] Remove deprecated authentication library
- [ ] Upgrade Node.js to latest LTS
- [ ] Consolidate duplicate utility functions

## Medium Priority (Fix This Quarter)
- [ ] Refactor legacy payment processing
- [ ] Improve database indexing strategy
- [ ] Add comprehensive API documentation

## Low Priority (Long-term)
- [ ] Migrate to newer framework version
- [ ] Consolidate redundant third-party services
- [ ] Implement proper microservices architecture
```

## Monitoring and Success Metrics

### Key Performance Indicators (KPIs)

**Technical Metrics:**
- Code coverage percentage (target: >80%)
- Average response time (target: <200ms)
- System uptime (target: >99.9%)
- Error rate (target: <0.1%)

**User Metrics:**
- Feature adoption rate
- User satisfaction score
- Task completion time
- Support ticket volume

**Development Metrics:**
- Feature delivery velocity
- Bug fix turnaround time
- Code review response time
- Documentation update frequency

### Budget AI Integration Success Indicators

- Reduced API costs by >60%
- Maintained or improved user satisfaction
- Successful model local deployment
- Performance metrics within acceptable bounds (-20% compared to premium models)

## Advanced Debugging Techniques

### Automated Analysis Tools

**Static Analysis:**
- ESLint/Prettier for code quality
- Dependency vulnerability scanners
- Performance profiling tools
- Security vulnerability checks

**Dynamic Analysis:**
- Runtime performance monitoring
- Memory leak detection
- Race condition identification
- Integration test automation

**System-level Monitoring:**
- Infrastructure health checks
- Database query performance
- Network traffic analysis
- Resource utilization tracking