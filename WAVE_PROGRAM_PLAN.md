# Wave Program Plan - Ghost Protocol

**Program**: Sprint-based contributor program with scoped issues  
**Duration**: 8 weeks (4 x 2-week sprints)  
**Cycle**: Repeats continuously

## Sprint Breakdown

### Sprint 1: Foundation & Testing (Weeks 1-2)
- **Bug Fixes** (High): CI/CD, tests, types | 2-4h, Easy
- **Documentation** (High): API docs, comments | 3-6h, Easy
- **Testing** (Critical): Integration, unit, e2e | 6-10h, Medium

### Sprint 2: Features & Integration (Weeks 3-4)
- **New Features** (Medium): Batch payments, key rotation | 8-16h, Hard
- **Integration** (Critical): SDK into frontend/relayer | 12-20h, Hard
- **Performance** (Medium): Optimize crypto, queries | 8-12h, Medium

### Sprint 3: UI/UX & Security (Weeks 5-6)
- **UI/UX** (Medium): Components, notifications, onboarding | 10-15h, Medium
- **Security** (Critical): Input validation, rate limiting, audit | 12-16h, Hard

### Sprint 4: DevOps & Deployment (Weeks 7-8)
- **DevOps** (Medium): Docker, logging, automation | 10-14h, Hard
- **Deployment** (High): Guides, health checks, SLA | 8-12h, Medium

## Work by Repository

- **ghost-sdk**: Testing, performance, security
- **ghost-contracts**: Features, security, testing
- **ghost-frontend**: UI/UX, integration, features
- **ghost-relayer**: Integration, DevOps, features

## Contributor Levels

**Level 1 - Entry**: Docs, simple fixes, basic tests | 2-4h | Basic TypeScript
**Level 2 - Intermediate**: Features, optimization, integration | 6-12h | Intermediate skills
**Level 3 - Advanced**: Complex features, security, architecture | 12+h | Advanced + crypto

## Issue Types

**Bug Fix**: Broken functionality, test failures, type errors | 2-4h
**Feature**: New capability for a repo | 8-16h
**Testing**: Unit/integration/e2e tests | 6-10h
**Documentation**: API docs, diagrams, guides | 3-6h
**UI/UX**: Components, flows, design | 10-15h
**Security**: Validation, encryption, audit | 12-16h
**DevOps**: Infrastructure, deployment, monitoring | 10-14h

## Contributor Workflow

1. Find issue (browse by difficulty/time)
2. Claim issue (comment "I'd like to work on this")
3. Work (follow standards, write tests)
4. Submit PR (link to issue, describe changes)
5. Review & Merge (address feedback, ensure tests pass)

## Issue Templates

```
Title: [BUG/FEATURE/TEST/DOCS] Description
Repository: (name)
Difficulty: Easy/Medium/Hard
Time: Xh
Acceptance Criteria:
- Criterion 1
- Criterion 2
```

---

**Status**: Ready to launch ✅
