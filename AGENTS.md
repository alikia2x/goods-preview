# Project Collaboration Requirements

## Project Overview

This is an online tool for creating 3D previews of goods (such as badges, keychains, etc.). Users can select the type of goods, upload images, view an interactive 3D preview in real-time, and export high-definition static images.

## Respect the Current Working Tree

- Treat the current working tree and the user's latest code changes as authoritative.
- Inspect relevant files before editing and preserve unrelated existing changes.
- Do not restore code to an earlier state because a historical request or previous response used different defaults.
- If the user directly edits the code, treat that as a requirements update and build on top of it.

## Routing and Page Structure

- Give each major feature or workflow its own page and route instead of putting unrelated functionality into one page component.
- Keep route configuration centralized and keep page components separate from reusable components.
- Prefer direct workflows and immediate feedback over unnecessary multi-step forms or hidden settings.
- Make imported data, generated files, and subscription-feed behavior explicit and reliable.

## UI and Copy

- Prefer existing shadcn/ui components. When a basic control is missing, use shadcn/ui CLI to download it. NEVER write basic components by yourself.
- Do not introduce a separate custom component system or add styles without functional value.
- Keep the UI restrained, clear, and suitable for a professional tool.
- Controls should be easy to scan and grouped by purpose.
- User-facing copy should be limited to feature names, field labels, status text, validation messages, and action labels.
- Remove promotional copy, implementation details, meaningless explanations, decorative labels, and exaggerated letter spacing.
- Do not add gradients, colorful decoration, or extra cards only for visual effect.

## Code Organization

- Keep route configuration in a central application entry point.
- Keep page components separate from reusable UI components.
- Keep shadcn/ui primitives in the established UI components directory.
- Keep reusable utilities and domain logic in dedicated modules; do not mix storage, calendar generation, or parsing logic into page JSX.
- Follow the existing project structure and naming conventions before introducing new directories or abstractions.

## Verification Requirements

After completing changes, run at least:

```bash
bun run build
bun run lint
git diff --check
```

Do not run a browser, start a development server, or perform frontend interaction checks unless the user requests it.
