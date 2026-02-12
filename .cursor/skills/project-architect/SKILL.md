---
name: project-architect
description: Analyzes entire project structure, evaluates implementation quality, suggests debugging workflows, and proposes new features optimized for free/budget AI models. Use when project needs architectural review, feature planning, or strategic technical guidance.
---

# Project Architect

## Overview

A strategic architect skill that provides comprehensive project analysis, evaluates implementation success, identifies debugging workflows, and proactively suggests performance and feature enhancements while optimizing for resource constraints.

## Core Capabilities

1. **Project State Analysis**: Evaluate current codebase structure, dependencies, and technical debt
2. **Implementation Quality Assessment**: Review feature completeness, documentation, and best practices adherence
3. **Automated Debugging Workflows**: Create reusable debugging patterns and identify common failure points
4. **Feature Innovation**: Suggest new capabilities aligned with project goals and resource optimization
5. **AI Model Optimization**: Recommend free and budget-friendly AI model integration strategies

## Analysis Framework

### Project Structure Evaluation

When analyzing project state:

1. **Repository Structure Review**
   - Analyze directory organization and naming conventions
   - Identify configuration files (package.json, requirements.txt, etc.)
   - Evaluate build/development tooling setup
   - Check for proper .gitignore and documentation standards

2. **Dependency Assessment**
   - Catalog all external dependencies and their versions
   - Identify potential security vulnerabilities
   - Flag deprecated or oversized libraries
   - Suggest lightweight alternatives where appropriate

3. **Code Quality Scan**
   - Look for consistent coding patterns and architecture
   - Identify areas lacking documentation or tests
   - Check for proper error handling and logging
   - Evaluate performance patterns and bottlenecks

### Implementation Success Metrics

Evaluate implementation quality using these criteria:

```markdown
1. Feature Completeness (0-10 scale):
   - Core functionality implemented: ___/10
   - Edge cases handled: ___/10
   - Performance meets requirements: ___/10
   - Proper error handling: ___/10

2. Documentation Quality (0-10 scale):
   - README completeness: ___/10
   - API documentation: ___/10
   - Inline code comments: ___/10
   - Usage examples provided: ___/10

3. Production Readiness (0-10 scale):
   - Testing coverage: ___/10
   - Environment configuration: ___/10
   - Deployment process: ___/10
   - Monitoring/logging: ___/10
```

### Debugging Workflow Generation

Create systematic debugging approaches:

1. **Common Issue Patterns**
   - Identify recurring error categories in the codebase
   - Create troubleshooting checklists for each pattern
   - Document known resolutions and workarounds

2. **Automated Diagnostics**
   - Design scripts to detect common configuration problems
   - Create validation tools for critical system components
   - Build health check endpoints for production monitoring

3. **Investigation Templates**
   - Structured debugging flowcharts
   - Log analysis patterns
   - Performance profiling techniques

## Innovation & Enhancement Suggestions

### Feature Prioritization Framework

When suggesting new features, prioritize by:

1. **Impact vs Complexity Matrix**
   - High Impact, Low Complexity: Immediate implementation
   - High Impact, High Complexity: Plan for major releases
   - Low Impact, Low Complexity: Add to backlog
   - Low Impact, High Complexity: Reject/deprioritize

2. **Free AI Model Optimization**
   - Suggest OpenAI GPT-3.5 and Claude Claude-3-Haiku alternatives
   - Recommend local model deployment strategies
   - Identify opportunities for model fine-tuning on budget platforms

3. **Performance Enhancement Areas**
   - Caching strategies for frequently accessed data
   - Async/parallel processing opportunities
   - Database query optimizations
   - CDN and asset optimization suggestions

### Enhancement Categories

**User Experience Improvements:**
- Modern UI component suggestions
- Accessibility feature additions
- Mobile-responsive design patterns
- Real-time update mechanisms

**Technical Architecture Upgrades:**
- Microservices decomposition opportunities
- API rate limiting and throttling
- Database sharding strategies
- Load balancing approaches

**Security & Compliance:**
- Authentication system enhancements
- Data encryption opportunities
- Logging and audit trail improvements
- GDPR/CCPA compliance additions

**Integration & Ecosystem:**
- Third-party API integrations
- Webhook implementation patterns
- Plugin architecture suggestions
- Export/import functionality

## Budget-Friendly AI Model Strategies

### Free Model Utilization

1. **Open Source Models**
   - Llama 2, Mistral, or CodeLlama local deployment
   - Hugging Face model hosting on free tiers
   - Ollama for local LLM integration

2. **Free API Tiers**
   - OpenAI GPT-3.5 with rate limiting
   - Claude Claude-3-Haiku for specific tasks
   - Google's Gemma models

3. **Resource Optimization Techniques**
   - Implement response caching to reduce API calls
   - Use smaller models for routine tasks
   - Batch processing for multiple AI operations

### Cost-Effective Workflows

Set up workflows that minimize expensive model usage:

```markdown
- Use rule-based logic first (pre-filter before AI)
- Cache AI responses for similar inputs
- Implement fallback to free models
- Set up progressive enhancement (basic → advanced AI)
- Monitor and alert on unusual usage patterns
```

## Execution Process

When activated, follow this systematic approach:

1. **Initial Assessment** (5-10 minutes)
   - Scan project structure and configuration
   - Identify key technologies and dependencies
   - Note any obvious red flags or opportunities

2. **Deep Dive Analysis** (15-30 minutes)
   - Review specific files requested by user
   - Analyze implementation patterns and quality
   - Create detailed evaluation metrics

3. **Strategic Recommendations** (10-15 minutes)
   - Generate prioritized enhancement list
   - Suggest debugging workflow improvements
   - Propose AI integration strategies

4. **Documentation & Tracking** (5-10 minutes)
   - Create comprehensive analysis report
   - Set up monitoring for suggested improvements
   - Establish success metrics for future evaluation

## Example Analysis Output

```markdown
# Project Architect Analysis: [Project Name]

## Current State Assessment
Repository Structure: ⭐⭐⭐⭐☆ (4/5)
- Well-organized directory structure
- Missing comprehensive README
- Needs better configuration management

Implementation Quality: ⭐⭐⭐☆☆ (3/5)
- Core functionality solid but lacks edge case handling
- Documentation coverage at 40%
- Performance optimizations needed for scale

## Priority Recommendations

**High Priority (Immediate)**
1. Add comprehensive error handling to core modules
2. Create user documentation and API reference
3. Implement basic monitoring and logging

**Medium Priority (Next Sprint)**
1. Optimize database queries (estimated 40% performance gain)
2. Add unit tests for critical path functions
3. Implement CI/CD pipeline for automated testing

**Long-term Strategy**
1. Migrate to microservices architecture for better scalability
2. Implement caching layer for API responses
3. Add machine learning features using free AI models

## AI Integration Opportunities
- Use Llama 2 (free) for natural language processing features
- Implement automated code review with GitHub Actions + free LLM
- Add chatbot support using fine-tuned smaller models
```

## Quick Reference Commands

For rapid project analysis:

- **Full Analysis**: Comprehensive review of entire codebase
- **Feature Focus**: Deep dive on specific functionality
- **Debug Workshop**: Create debugging workflows for current issues
- **AI Strategy**: Free/budget AI model integration planning
- **Performance Tuning**: Identify optimization opportunities