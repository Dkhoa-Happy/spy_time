# Spy Time - React JS Clean Architecture Starter

Boilerplate React JavaScript theo clean architecture, da setup san:

- React Router
- Redux Toolkit + React Redux
- UI foundation theo phong cach shadcn (Button + `cn` utility)
- Tailwind CSS v4
- Alias import `@/`

## Run Project

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Folder Structure

```text
src/
	app/
		layouts/       # App layouts
		providers/     # Global providers (Redux, etc.)
		router/        # Route definitions
		store/         # Redux store + slices
	pages/           # Route-level pages
	widgets/         # UI blocks (compose features/entities)
	features/        # Use-cases and user interactions
	entities/        # Domain entities
	shared/
		constants/     # Constants (routes, enums)
		lib/           # Reusable helpers
		ui/            # Reusable UI components
```

## What Is Ready

- `MainLayout` + `HomePage` + `NotFoundPage`
- Sample Redux slice: `appSlice`
- Sample UI component: `Button` (variants from `class-variance-authority`)
- Theme den/trang voi accent `#FF5722`

## Next Implementation Pattern

1. Tao use-case moi trong `features/`
2. Tach state vao store slice trong `app/store/slices/`
3. Tao page moi trong `pages/` va khai bao route trong `app/router/`
4. Tai su dung component chung tu `shared/ui/`
