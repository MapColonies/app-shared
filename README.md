# App-Shared

A centralized TypeScript package for APPLICATION(S) shared, cross-domain resources, designed to reduce code duplication and improve type safety across Map Colonies services.

## Package Design

This package serves as a single source of truth for shared resources used across Map Colonies applications, following these key principles:
- **Centralization**: Eliminates code duplication across services
- **Type Safety**: Ensures consistent typing across services
- **Modular Architecture**: Organized into clear sub-domains
- **Minimal Dependencies**: Reduces external dependencies for better maintainability

## Package Structure

```
app-shared/
├─ src/
│  ├─ enums/           # Shared enums
│  │  ├─ basemap/      # Basemap-related enums
│  │  └─ common/       # Cross-domain enums
│  └─ schemas/         # Zod validation schemas (+ inferred types)
│     └─ basemap/      # Basemap-related schemas
└─ [Configuration files]
```
