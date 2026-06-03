# PRPB (prpblog.com)

Welcome to the source code for [prpblog.com](https://prpblog.com). This document serves as a quick reference for the project architecture and setup.

## Architecture & Tech Stack

The project consists of three main parts:

1. **Frontend (Web)**
   - Framework: Astro for static site generation.
   - Styling: Tailwind CSS with shadcn/ui (React components).
   - Content: Markdown / MDX (`@astrojs/mdx`) for blog posts.
   - Hosting: AWS S3 + CloudFront (managed via Terraform).

2. **Backend (API & Database)**
   - Provider: Supabase.
   - Access: Supabase Data API for querying.

3. **Infrastructure & CI/CD**
   - IaC: Terraform (`terraform/` directory).
   - Pipelines: GitHub Actions (`.github/workflows/`).

## Environments

The project utilizes four environments:
- Local: Docker + Supabase Dev.
- Dev: AWS infrastructure + Supabase Dev.
- Staging: AWS infrastructure + Supabase Dev.
- Prod: AWS infrastructure + Supabase Prod.

Note: Supabase only has two environments (Dev and Prod). The `dev` database is shared across Local, Dev, and Staging.

## Getting Started

### Prerequisites
- Node.js
- Docker & Docker Compose
- Supabase CLI
- Terraform

### Local Development

1. **Environment Variables**: Make sure you have `.env.development` or `.env.local` configured in the root of your project.
2. **Supabase Dev**:
   - Open `supabase/config.toml` and replace `<project_id>` with your Supabase dev instance ID.
   - If using the CLI locally, you can start the local Supabase instance with `supabase start` (or connect directly to your remote dev DB).
   - Once the local instance is running, you can access the **Supabase Studio** dashboard at http://localhost:54323. This UI allows you to inspect tables, manage data, write SQL queries, and view logs locally.
   - The Local API is accessible at http://localhost:54321, and you can connect directly to the local database at `postgresql://postgres:postgres@localhost:54322/postgres`.
3. **Start Frontend**:
   - Using Docker:
     ```sh
     docker compose up -d
     ```
     This maps `.env.local` to `.env.development` inside the container and starts the Astro server. Stop it with `docker compose down`.
   - Using Node natively:
     ```sh
     npm install
     npm run dev
     ```
4. The site will be running at http://localhost:43210.

## Content Management (Blogs & Tags)

Writing a new blog post requires strict tag management.
- Location: Add new `.mdx` files to `src/pages/blog/`.
- Assets: Place related images in `src/assets/blog/<post-slug>/`.
- Tags Validation: Every blog post must use tags that already exist in the Supabase `tags` table.
- Before deployment, unit tests will run to verify that no invalid tags are used in your MDX frontmatter. If an invalid tag is found, the pipeline will fail.

## Testing

The project uses a combination of unit and end-to-end tests to ensure stability.
- Unit Tests (Vitest):
  ```sh
  npm run test:unit
  ```
  Primarily used to validate component logic and blog metadata (tags).
- E2E Tests (Playwright):
  ```sh
  npm run test:e2e
  ```

## Infrastructure & Deployment

### Terraform Management
Infrastructure is defined in the `terraform/` directory.
- State is managed per environment (`backend-development.hcl`, `backend-production.hcl`, etc.).
- Variables are defined in `terraform/tfvars/`.

### Deployments
Deployments are handled automatically by GitHub Actions (`deploy.yml`). However, you can manually trigger a deployment to the `dev` environment locally using the provided shell script:

```sh
# Deploys to Dev, applies Terraform, and auto-approves changes
npm run deploy

# Which maps to:
# bash scripts/deploy-dev.sh --deploy-terraform --auto-approve-terraform
```

## Key Directories

- `.github/`: CI/CD workflows and actions.
- `src/`: Astro pages, React components (`components/ui`), layouts, and MDX blogs.
- `supabase/`: Database migrations, seed data, and Supabase config.
- `terraform/`: AWS Infrastructure code (S3, CloudFront, etc.).
- `scripts/`: Utility scripts like `deploy-dev.sh`.
- `tests/`: Vitest and Playwright test suites.
