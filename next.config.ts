import { execSync } from 'node:child_process'
import type { NextConfig } from 'next'

/* The build stamp the compact site's footer prints (DESIGN.md §5b): the commit
   being built (Vercel's, else the local checkout's) and the day. Read once at
   build time, so every page stays static. */
function commit() {
  const vercel = process.env.VERCEL_GIT_COMMIT_SHA
  if (vercel) return vercel.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return ''
  }
}

const nextConfig: NextConfig = {
  /* Hosted as plain files on S3 behind CloudFront (ARCHITECTURE.md §2), so the
     build must emit a static site into out/. Addresses carry no trailing slash
     (owner's call, November 2026: /compact, not /compact/), so each route is a
     file, compact.html, which the CloudFront function (infra/cloudfront-url.js)
     maps the bare address onto; the default image optimizer needs a server, so
     images ship as built. */
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  env: {
    BUILD_COMMIT: commit(),
    BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
}

export default nextConfig
