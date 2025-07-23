# CyberGuard - Cyberbullying Reporting System

A comprehensive frontend application for reporting and managing cyberbullying incidents using local storage for data persistence.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Storage**: Local Storage for data persistence
- **Authentication**: Local storage based authentication

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Features

### Core Functionality
- **Anonymous Reporting**: Users can report cyberbullying incidents anonymously
- **Interactive Map**: Visual representation of incident locations
- **Q&A Community**: Users can ask questions and get support
- **Experience Sharing**: Share and learn from others' experiences
- **AI Chat Support**: AI-powered counseling and guidance

### Admin Features
- **Dashboard**: Overview of all reports and statistics
- **Report Management**: Review and manage incident reports
- **Content Moderation**: Approve/reject questions and experiences
- **Critical Area Detection**: Automatic identification of cyberbullying hotspots

### Security & Privacy
- **JWT Authentication**: Secure token-based authentication
- **Data Encryption**: Passwords hashed with bcrypt
- **Rate Limiting**: Protection against abuse
- **Anonymous Options**: Privacy-first approach for sensitive reports

## Default Accounts

- **Admin**: `admin@gmail.com` / `Admin@6202`
- **Cybercrime Officer**: `cybercrime@gmail.com` / `Cyber@6202`

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Leaflet for interactive maps
- Lucide React for icons

### Storage
- Local Storage for data persistence
- Client-side data management
- No external database required

## Development

### Development
```bash
npm run dev  # Starts development server
npm run build  # Build for production
npm run preview  # Preview production build
```

## Data Storage

All data is stored locally in the browser's localStorage:
- User accounts and authentication
- Cyberbullying reports
- Q&A questions and answers
- User experiences and stories

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.