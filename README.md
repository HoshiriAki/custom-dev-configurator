# custom-dev-configurator

Public customer-facing configurator for custom-development requirements and budget estimates.

## Security boundary

This repository is intentionally public. It may contain UI, public capability codes, labels, descriptions, request schemas, and API client code. It must **not** contain:

- Pricing Unit (PU) values or capability weights
- complexity / risk / urgency multipliers
- margin floors or minimum deal rules
- internal discounts and customer scoring
- AI system prompts
- API, payment, database, or webhook secrets

The browser may display a price returned by the API, but it never owns the authoritative price.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` to the private pricing API. If it is absent, the public catalog still renders but estimate submission is disabled with a clear error.

## GitHub Pages

The repository includes a Pages workflow. Configure the repository variable `VITE_API_BASE_URL` with the deployed public API base URL before production use.

## Current MVP

- project type selection
- public capability catalog
- business entity hints
- integration/risk inputs
- free-text requirements
- estimate API client
- responsive estimate result UI

Authoritative pricing and quote/order state live in `HoshiriAki/custom-dev-pricing` (private).
