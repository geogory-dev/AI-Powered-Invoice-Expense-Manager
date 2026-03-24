import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { updateSession } from '@/utils/supabase/middleware'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/upload(.*)',
  '/api/parse(.*)',
  '/api/expenses(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
  // Temporarily disable Supabase session refresh to debug Edge module error
  // return await updateSession(req)
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
