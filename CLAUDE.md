# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MahaLaxmi Hardware is a Next.js e-commerce application for a hardware store. The project uses Next.js 15 with React 19, TypeScript, Tailwind CSS, and Radix UI components via Shadcn/ui.

## Common Commands

```bash
# Development
npm run dev                 # Start development server with Turbopack
npm run build              # Build for production
npm start                  # Start production server
npm run lint               # Run ESLint

# Development server runs on http://localhost:3000
```

## Architecture

### Directory Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/` - Reusable React components organized by feature
- `/src/services/` - API service layer for backend communication
- `/src/lib/` - Utility functions, types, and shared libraries
- `/src/hooks/` - Custom React hooks
- `/public/` - Static assets

### Key Architectural Patterns

**Service Layer Pattern**: All API communication is abstracted through service files in `/src/services/`:
- `authService.ts` - User authentication and profile management
- `productService.ts` - Product catalog operations
- `cartService.ts` - Shopping cart functionality
- `orderService.ts` - Order management
- `paymentService.ts` - Payment processing

**Component Organization**: Components are organized by domain:
- `/components/ui/` - Reusable UI components (Shadcn/ui)
- `/components/layout/` - Layout components (Header, Footer)
- `/components/home/`, `/components/products/`, etc. - Feature-specific components

**Type Safety**: TypeScript is used throughout with:
- Custom types defined in `/src/lib/types.ts`
- Path aliases configured: `@/` maps to `./src/`
- Strict TypeScript configuration

## Configuration

- **UI Framework**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom configuration
- **Icons**: Lucide React
- **State Management**: React state and Context API
- **HTTP Client**: Axios for API requests
- **Image Handling**: Next.js Image with AWS S3 domain configured

## API Integration

The application communicates with a backend API. Services use a standardized `ApiResponse<T>` type for consistent error handling and response structure.

## Performance & Caching

**Client-Side Caching**: TanStack Query (React Query) is configured for:
- API response caching with 5-minute stale time
- Background refetching and optimistic updates
- Query invalidation on mutations
- Custom hooks in `/src/hooks/` for cached data fetching

**Next.js Caching**: 
- Static optimization enabled with stale-while-revalidate
- Image optimization with WebP/AVIF formats
- Static assets cached for 1 year
- API routes cached for 5 minutes

**Performance Utilities**:
- `/src/lib/performance.ts` - Debounce, throttle, and monitoring utilities
- `/src/components/ui/OptimizedImage.tsx` - Optimized image component with lazy loading
- Intersection Observer for lazy loading

## Security Features

**HTTP Security Headers**:
- Content Security Policy (CSP) restricting script/style sources
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff
- Referrer-Policy and Permissions-Policy configured

**Input Validation & Rate Limiting**:
- `/src/lib/validation.ts` - Input sanitization and validation utilities
- Client-side rate limiting (10 requests/minute general, 5 auth requests/5 minutes)
- Password strength validation, email/phone validation
- Search query sanitization

**API Security**:
- Request timeout: 10 seconds
- CSRF protection with X-Requested-With header
- Automatic token refresh with retry logic

## Development Notes

- Uses Next.js App Router (not Pages Router)
- Configured for Turbopack in development for faster builds
- ESLint configured with Next.js and TypeScript rules
- Image optimization configured for AWS S3 bucket: `mahalaxmi-test.s3.ap-south-1.amazonaws.com`
- React Query DevTools available in development mode