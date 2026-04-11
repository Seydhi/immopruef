import type { BlogMeta } from './BlogLayout'
import { BLOG_POSTS } from './posts'

interface BlogIndexProps {
  onNavigate: (slug: string) => void
}

export default function BlogIndex({ onNavigate }: BlogIndexProps) {
  return (
    <div className="max-w-[680px] mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-green mb-2">Blog</h1>
        <p className="text-ink-mid text-sm">Ratgeber, Tipps und Wissen rund um den Immobilienkauf</p>
      </div>

      <div className="space-y-4">
        {BLOG_POSTS.map((post: BlogMeta) => (
          <button
            key={post.slug}
            onClick={() => onNavigate(post.slug)}
            className="w-full text-left bg-white border border-ink/10 rounded-xl p-5 hover:border-green/30 hover:shadow-sm transition-all group"
          >
            <h2 className="font-display text-lg font-medium text-ink group-hover:text-green transition-colors mb-1.5">
              {post.title}
            </h2>
            <p className="text-sm text-ink-mid leading-relaxed mb-3">{post.description}</p>
            <div className="flex items-center gap-3 text-xs text-ink-light">
              <time>{post.date}</time>
              <span className="text-ink/20">·</span>
              <span>{post.readTime} Lesezeit</span>
              <span className="text-ink/20">·</span>
              <div className="flex gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-green/8 text-green text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
