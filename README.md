# Simple Schedule Manager

<div align="center">
  <img src="public/placeholder.svg" alt="Simple Schedule Manager Logo" width="120" />
  <h3 align="center">A modern student and course management system</h3>
  
  [![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-app-id/deploy-status)](https://app.netlify.com/sites/your-netlify-app-name/deploys)
</div>

## 📖 Overview

Simple Schedule Manager is a comprehensive web application designed for educational institutions to manage students, courses, and enrollments. With an intuitive user interface and powerful features, it streamlines the administrative workflow of managing educational resources.

### ✨ Key Features

- **Student Management**: Add, view, edit, and delete student records
- **Course Administration**: Manage course offerings with detailed information
- **Enrollment System**: Easily assign students to courses and vice versa
- **Interactive Dashboard**: View key statistics and recent activities
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark/Light Mode**: Customizable UI appearance for user preference

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/username/simple-schedule-manager.git

# Navigate to the project directory
cd simple-schedule-manager

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:8080`

## 🏗️ Architecture

The project follows a modern React application architecture with the following key components:

### Frontend Technology Stack

- **React 18**: UI component library with hooks for state management
- **TypeScript**: Type-safe JavaScript for improved developer experience
- **Vite**: Fast build tooling and development server
- **React Router**: Client-side routing for SPA navigation
- **React Query**: Data fetching and cache management
- **Shadcn UI**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Zod**: Schema validation library

### API Integration

The application connects to a RESTful API backend at:
```
http://ec2-34-207-147-146.compute-1.amazonaws.com:8080/api
```

The API integration is implemented in `src/utils/api.ts` and provides the following services:
- Student management endpoints
- Course management endpoints
- Enrollment operations
- Health check endpoints
- Dashboard statistics

## 📂 Project Structure

```
simple-schedule-manager/
├── public/               # Static assets
├── src/                  # Source code
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Core UI components
│   │   └── layout/       # Layout components
│   ├── context/          # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── pages/            # Application pages
│   │   ├── auth/         # Authentication pages
│   │   ├── courses/      # Course management pages
│   │   └── students/     # Student management pages
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions and API
├── .gitignore            # Git ignore file
├── index.html            # HTML entry point
├── package.json          # Project dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 🧩 Features In-Depth

### Student Management

- **List View**: Paginated list of all students with search functionality
- **Detail View**: Comprehensive view of student information and enrolled courses
- **Form**: Add new students or edit existing ones with validation
- **Enrollment**: Assign or remove courses for a specific student

### Course Management

- **List View**: View all available courses with filtering capabilities
- **Detail View**: Course details including enrolled student list
- **Form**: Create and edit courses with proper validation
- **Enrollment**: Manage student enrollment for each course

### Dashboard

The dashboard provides an overview of system statistics:
- Total number of students
- Total number of courses
- Student-to-course ratio
- Recent enrollment activities

## 🔧 Advanced Usage

### Environment Variables

You can customize the API endpoint by setting the `VITE_API_BASE_URL` environment variable.

Create a `.env.local` file in the project root:

```
VITE_API_BASE_URL=http://your-api-endpoint.com/api
```

### Authentication

The application includes a mock authentication system that can be extended to use JWT tokens with a real backend. The authentication logic is handled in `src/context/AuthContext.tsx`.

### Custom Theming

The application uses Tailwind CSS for styling and can be customized by editing the `tailwind.config.ts` file:

```typescript
// Example of theme customization
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#3b82f6',
        // Add custom color shades
      }
    }
  }
}
```

## 📱 Responsive Design

The application is fully responsive and provides an optimal experience on:

- Desktop computers
- Tablets
- Mobile devices

The responsive design is implemented using Tailwind CSS's responsive modifiers.

## 🧪 Testing

Run the test suite with:

```bash
npm test
# or
yarn test
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

The production build will be available in the `dist` directory.

### Deployment Options

You can deploy this application to various platforms:

- **Netlify**: Connect your GitHub repository to Netlify for automatic deployments
  - Quick deploy: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/joshbarros/reactjs-simpleschedulingsystem-app)
- **Vercel**: Use the Vercel platform for seamless React application hosting
- **GitHub Pages**: Deploy static sites directly from your GitHub repository
- **AWS Amplify**: Host the application on AWS with CI/CD capabilities
- **Docker**: Containerize the application for deployment on any container orchestration platform

## 📝 Deploying to Netlify

This project is configured for easy deployment to Netlify:

1. Fork or clone this repository to your GitHub account
2. Sign up for a Netlify account if you don't have one
3. From the Netlify dashboard, click "New site from Git"
4. Select GitHub and choose your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

The application contains a `netlify.toml` configuration that handles:
- Build settings
- SPA routing (redirects all routes to index.html)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)
- [React Query](https://tanstack.com/query/)
