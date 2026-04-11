import type { BlogMeta } from '../BlogLayout'

// Blog posts registry — newest first
export const BLOG_POSTS: BlogMeta[] = [
  // Posts will be added here as they are created
]

// Map slug → lazy component
export const POST_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  // 'slug': lazy(() => import('./slug')),
}
