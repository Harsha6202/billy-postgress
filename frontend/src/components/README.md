# Project Structure

```
src/
├── components/           # UI Components
│   ├── admin/           # Admin-specific components
│   ├── chat/            # Chat-related components
│   ├── cybercrime/      # Cybercrime portal components
│   ├── dashboard/       # Dashboard components
│   ├── experiences/     # Experience sharing components
│   ├── maps/           # Map-related components
│   └── shared/         # Shared/common components
│
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── DataContext.tsx
│
├── services/          # Business logic and API calls
│   ├── api/          # API-related services
│   └── utils/        # Utility services
│
├── types/            # TypeScript type definitions
│   ├── index.ts
│   └── experience.ts
│
├── utils/            # Helper functions
│   ├── geocoding.ts
│   └── reportUtils.ts
│
├── hooks/            # Custom React hooks
│   └── useReportAnalysis.ts
│
├── config/           # Configuration files
│   └── mapConfig.ts
│
└── assets/          # Static assets
    └── images/
```

Key Directories:

1. `components/`: UI components organized by feature
2. `context/`: Global state management
3. `services/`: Business logic and external services
4. `types/`: TypeScript interfaces and types
5. `utils/`: Helper functions and utilities
6. `hooks/`: Reusable React hooks
7. `config/`: Configuration files
8. `assets/`: Static assets like images