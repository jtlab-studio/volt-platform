# Volt Platform

A web application for runners, cyclists, and hikers to analyze race routes and generate similar training routes based on elevation profiles and gradient distributions.

## Features

- **GPX Upload & Analysis**: Upload GPX files to instantly see elevation profiles and gradient distributions
- **Smart Route Synthesis**: Find local routes that match your target race's terrain characteristics
- **ITRA Effort Distance**: Calculate and compare routes using the International Trail Running Association metric
- **Personal Library**: Save and manage your collection of race routes
- **Multi-language Support**: Available in English and Korean

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS with glassmorphism design
- Leaflet for interactive maps
- i18next for internationalization
- Zustand for state management
- Supabase for authentication

### Backend
- Rust 1.87
- Axum web framework
- SQLite for development, Postgres for production
- R-tree spatial indexing
- JWT authentication

## Getting Started

### Prerequisites
- Node.js v20.x LTS
- npm v10.x
- Rust 1.87
- SQLite 3.x

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
cargo build
cargo run
```

## Development

The application runs on:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Project Structure

```
volt-platform/
├── frontend/          # React application
│   ├── src/
│   │   ├── core/     # Core utilities and types
│   │   ├── ui/       # Reusable UI components
│   │   ├── features/ # Feature modules (auth, race, synthesis)
│   │   ├── pages/    # Page components
│   │   └── App.tsx   # Main application
│   └── package.json
└── backend/          # Rust API server
    ├── src/
    │   ├── api/      # HTTP routes and middleware
    │   ├── core/     # Business logic
    │   ├── db/       # Database layer
    │   └── spatial/  # Spatial indexing
    └── Cargo.toml
```

## License

MIT License

## Contributing

Please read our contributing guidelines before submitting pull requests.
