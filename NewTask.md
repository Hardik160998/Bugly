I am building a full-stack SaaS application (Website Feedback & Bug Reporting Tool) with the following stack:

Frontend: Next.js (React) + Tailwind CSS
Backend: Node.js (Express) deployed on Vercel (serverless)
Database: PostgreSQL with Prisma ORM
Storage: AWS S3 / Cloudinary

Current problem:
My application is experiencing very slow API response times, especially when fetching bug reports, projects, and dashboard data. The delay is noticeable on every page load and revisit. The issue seems to be mainly from database queries and serverless backend performance.

I want you to act as a senior performance engineer and optimize my system.

Tasks:
Analyze Performance Bottlenecks
Identify why API responses are slow (DB queries, cold starts, Prisma, serverless issues)
Detect N+1 queries or inefficient Prisma usage
Optimize Database (PostgreSQL + Prisma)
Add proper indexing strategy (bugs, projects, user relations)
Optimize Prisma queries (use select/include properly, avoid over-fetching)
Implement pagination instead of loading full datasets
Suggest query restructuring for performance
Optimize Backend (Vercel Serverless)
Fix cold start issues
Implement connection reuse for Prisma
Remove blocking code and improve async handling
Add response caching where possible
Implement Caching Strategy
Server-side caching (Redis or in-memory cache for dashboard stats & bug list)
Client-side caching using React Query / SWR
Prevent duplicate API calls
Optimize API Design
Reduce payload size
Create optimized endpoints for dashboard (aggregated queries instead of multiple calls)
Frontend Optimization
Implement lazy loading and skeleton loaders
Avoid unnecessary re-renders and API refetch
Use debounce for search
Add Performance Enhancements
Enable compression (gzip/brotli)
Use CDN caching where applicable
Provide Code Fixes
Show optimized Prisma queries
Show caching implementation examples
Show improved API route examples
Scalability Plan
Suggest how to handle 100k+ users
Recommend architecture improvements if needed
Important Context:
Backend is deployed on Vercel (serverless)
Prisma is used for database access
Dashboard loads multiple datasets (bugs, stats, projects)
Performance is critical for user experience
Expected Output:
Clear root cause
Optimized code snippets
Step-by-step improvements
Practical fixes I can directly implement

Focus on real-world, production-level optimizations.