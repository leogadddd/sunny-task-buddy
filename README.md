# UpTrack

A modern, full-stack task management application built with React, TypeScript, GraphQL, and PostgreSQL.

## 🏗️ Architecture

This project follows a modular architecture with separate frontend and backend applications:

- **Frontend**: React + TypeScript + Vite + Apollo Client + Shadcn/ui
- **Backend**: Node.js + TypeScript + Apollo Server + GraphQL + Prisma
- **Database**: PostgreSQL
- **Development**: Docker Compose for easy local development

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd uptrack
   ```

2. **Start the development environment**

   ```bash
   npm run dev
   ```

   This will start:

   - PostgreSQL database on port 5432
   - Backend GraphQL API on port 4000
   - Frontend React app on port 5173 (mapped to internal port 8080)

3. **Setup the database** (first time only)
   ```bash
   # In a new terminal
   npm run backend:migrate
   ```

### Dependency Management

When adding new dependencies to `package.json`, you need to rebuild the Docker containers:

#### Quick Setup (Recommended)

```bash
# Install all dependencies and rebuild containers
./quick-setup.sh
```

#### Manual Setup

```bash
# Install dependencies for specific services
./install-deps.sh frontend    # Frontend only
./install-deps.sh backend     # Backend only
./install-deps.sh all         # Both services

# Or rebuild containers manually
./install-deps.sh rebuild
```

### Local Development (without Docker)

1. **Install dependencies**

   ```bash
   npm run install:all
   ```

2. **Start PostgreSQL** (you'll need PostgreSQL running locally)

   ```bash
   # Make sure PostgreSQL is running on port 5432
   # Update the DATABASE_URL in backend/.env if needed
   ```

3. **Setup the database**

   ```bash
   npm run backend:generate
   npm run backend:migrate
   ```

4. **Start the development servers**

   ```bash
   # Terminal 1: Backend
   npm run backend:dev

   # Terminal 2: Frontend
   npm run frontend:dev
   ```

## 📂 Project Structure

```
sunny-task-buddy/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and configurations
│   │   │   └── apollo/     # Apollo Client setup
│   │   └── hooks/          # Custom React hooks
│   ├── package.json
│   └── Dockerfile
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── graphql/        # GraphQL schema and resolvers
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   │   └── schema.prisma
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Docker services configuration
└── package.json            # Root package with unified scripts
```

## 🛠️ Available Scripts

### Development Commands

- `npm run dev` - Start all services with Docker Compose
- `npm run dev:detached` - Start services in background
- `npm run dev:logs` - View logs from all services
- `npm run dev:stop` - Stop all services
- `npm run dev:restart` - Restart all services
- `npm run dev:rebuild` - Rebuild and start services
- `npm run dev:clean` - Stop services and remove volumes

### Backend Commands

- `npm run backend:dev` - Start backend in development mode
- `npm run backend:build` - Build backend for production
- `npm run backend:migrate` - Run database migrations
- `npm run backend:generate` - Generate Prisma client
- `npm run backend:studio` - Open Prisma Studio

### Frontend Commands

- `npm run frontend:dev` - Start frontend development server
- `npm run frontend:build` - Build frontend for production
- `npm run frontend:preview` - Preview production build

### Setup Commands

- `npm run install:all` - Install dependencies for both frontend and backend
- `npm run setup` - Complete project setup (install + generate)
- `npm run reset:db` - Reset database (⚠️ destructive)

## 🌐 API Endpoints

- **GraphQL Playground**: http://localhost:4000/graphql
- **Frontend App**: http://localhost:5173
- **Prisma Studio**: Run `npm run backend:studio`

## 🔧 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:password@localhost:5432/sunny_task_buddy?schema=public"
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000/graphql
```

## 📊 Database Schema

The application uses the following main entities:

- **Users**: Authentication and user management
- **Organizations**: Group users and projects
- **Projects**: Contain tasks and have assignees
- **Tasks**: Individual work items with status tracking

## 🚀 Deployment

The application is containerized and ready for deployment to any Docker-compatible platform:

- **Docker Hub**: Push images to Docker Hub
- **AWS ECS/EKS**: Deploy to AWS container services
- **Google Cloud Run**: Deploy to Google's serverless containers
- **DigitalOcean App Platform**: Simple deployment option
- **Railway/Render**: Easy deployment platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Port Already in Use

If you get port conflicts, you can modify the ports in `docker-compose.yml`.

### Database Connection Issues

Make sure PostgreSQL is running and the DATABASE_URL is correct in your environment variables.

### GraphQL Schema Errors

If you modify the GraphQL schema, make sure to restart the backend service.

### Container Build Issues

Try rebuilding the containers: `npm run dev:rebuild`

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9e72c21c-a5e9-4b9b-9181-131268267bd2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
```
