# Civic Engagement Learning Campaigns

This platform includes AI-guided learning campaigns. **To spin off as your own site or host for free**, see [SPINOFF_AND_HOSTING_GUIDE.md](SPINOFF_AND_HOSTING_GUIDE.md).
 focused on digital citizenship, grassroots political organizing, civic engagement, and the history of popular movements that toppled authoritarian regimes with laughter and unity.

## Campaign Topics

### Movement History (Case Studies)

| Campaign | Focus | Key Lessons |
|----------|-------|-------------|
| **Serbia: Otpor! and the Fall of Milosevic** | Youth-led nonviolent revolution (2000) | Humor as delegitimization ("Gotov je!"), unity across ethnic divides, CANVAS model |
| **Euromaidan (Ukraine 2013-2014)** | Grassroots mobilization in Kyiv | Self-organization (kitchens, medical, media), solidarity as resistance, dignity as unifying theme |
| **Hong Kong: Creative Resistance** | Umbrella Movement to 2019 protests | Lennon walls, "Be Water" philosophy, digital coordination under pressure |
| **Laughter and Unity: Weapons Against Authoritarianism** | Comparative analysis | Why humor works, unity-building across divides, when tactics help or backfire |

### Skills & Organizing

| Campaign | Focus | Key Lessons |
|----------|-------|-------------|
| **Digital Citizenship Fundamentals** | Fact-checking, media literacy, safe communication | Verify before sharing, operational security basics, ethical information sharing |
| **Grassroots Political Organizing** | One-on-ones, leadership development, power mapping | Relational organizing, issue selection, coalition building |
| **Civic Engagement Foundations** | Voting, public comment, local government | Navigate government structures, sustainable civic habits |

## Learning Goals (from learningConfig.ts)

- **digital_citizenship**: Fact-checking, media literacy, safe communication, ethical sharing
- **grassroots_organizing**: One-on-ones, leadership development, power mapping, coalition building
- **civic_engagement**: Democratic participation, voting, public comment, civic habits
- **movement_history**: Case studies of nonviolent resistance (Serbia, Ukraine, Hong Kong)

## Teaching Adaptations

All civic campaigns support five learning styles:

- **Experiential**: Role-play, hands-on simulations, learn by doing
- **Visual**: Timelines, power maps, coalition diagrams
- **Analytical**: Gene Sharp, Erica Chenoweth, social movement theory
- **Social**: Discussion, peer exchange, community case studies
- **Pragmatic**: Step-by-step playbooks, checklists, quick reference

## Arc Templates (Campaign Builder)

Civic-specific arc templates for the visual flow editor:

- **Movement Case Study**: Context Research → Tactic Analysis → Lesson Extraction
- **Grassroots Campaign**: Issue Selection → Power Analysis → One-on-One Plan → Leadership Team
- **Digital Citizenship**: Claim Identification → Fact-Check → Context Assessment → Ethical Decision
- **Humor and Unity**: Legitimacy Analysis → Ridicule Design → Unity Message → Tactical Plan
- **Civic Engagement Starter**: Government Map → Participation Opportunities → First Action

## Obsidian Template

Use `obsidian-vault/Templates/Civic Campaign Template.md` to create new civic campaigns with Templater. Includes frontmatter for learning objectives, teaching adaptations, and movement-specific metadata.

## Integration Points

- **AgentChat**: Civic campaigns appear in the module picker; AI uses `civic_engagement` capability for guidance
- **CampaignsHub**: Civic campaigns shown first with route `/investigate?campaign=<id>`
- **Home**: Civic Engagement section with quick links to Serbia, Euromaidan, Hong Kong, Laughter & Unity
- **Templates**: `bash templates/setup.sh civic ./output` for civic-focused deployments
