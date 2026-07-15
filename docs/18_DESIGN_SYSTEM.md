# Design System

## Brand direction

Premium old-school legal authority with modern operational clarity.

### Core palette

- Deep charcoal: `#111214`
- Black: `#08090A`
- Antique gold: `#B8944F`
- Ivory: `#F4F0E6`
- Warm gray: `#A7A29A`
- Success, warning and danger colors must meet contrast requirements and never rely on color alone.

These are implementation defaults, not final logo assets.

## Typography

- Editorial serif for public headings and formal generated-document accents.
- Highly readable sans serif for application UI and dense legal operations.
- Avoid novelty “law” fonts, fake seals and decorative clutter.

## Voice

- Direct, calm, dignified and factual.
- No exaggerated promises, “best lawyer” claims, guaranteed results or fabricated social proof.
- Error messages explain the next safe action without exposing confidential object existence.

## Application layout

- Desktop-first operational shell with responsive tablet/mobile support.
- Clear left navigation, global search and role-aware action area.
- Dense tables are permitted but require filters, sticky headings, keyboard support and accessible mobile alternatives.
- Matter number and confidentiality badge remain visible in matter workspace.

## Components

Required reusable components:

- page header and breadcrumb;
- status/confidentiality badges;
- permission-aware action menu;
- data table with pagination/filter/sort;
- command/global search;
- timeline/history;
- audit metadata panel;
- safe confirm dialog requiring reason for high-risk actions;
- uploader with scan state;
- document preview shell;
- empty/loading/error/permission states;
- form field with validation summary;
- stale-version conflict dialog;
- client-visible/internal visibility indicator.

## Accessibility

- WCAG-oriented semantic markup and contrast.
- Full keyboard operation for core workflows.
- Visible focus.
- Labels and descriptions for all inputs.
- Error summary and field association.
- Screen-reader text for icon-only controls.
- Motion reduction support.

## Synthetic screenshots

Development screenshots and demos use fictional law-office data only. No real names or client documents.
