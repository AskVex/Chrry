/**
 * Site configuration based on domain
 * Detects if running on chrry.dev or askvex.com
 */

export type SiteMode = "chrryDev" | "vex" | "chrryAI" | "chrryStore"

export interface SiteConfig {
  mode: SiteMode
  name: string
  domain: string
  description: string
  logo: string
  primaryColor: string
  links: {
    github?: string
    npm?: string
    docs?: string
    demo?: string
  }
  features: Array<{
    title: string
    description: string
    icon: string
    link?: string
    isOpenSource?: boolean
  }>
}

/**
 * Detect which site we're running on
 */
export function detectSiteMode(): SiteMode {
  if (typeof window === "undefined") return "vex" // SSR default

  const hostname = window.location.hostname

  // Check if running on chrry.dev or localhost with CHRRY env
  if (
    hostname.includes("chrry.dev") ||
    process.env.NEXT_PUBLIC_SITE_MODE === "chrryDev"
  ) {
    return "chrryDev"
  }

  if (
    hostname.includes("chrryAI.dev") ||
    process.env.NEXT_PUBLIC_SITE_MODE === "chrryAI"
  ) {
    return "chrryAI"
  }

  return "vex"
}

/**
 * Get site configuration based on current domain
 */
export function getSiteConfig(m?: string): SiteConfig {
  const mode = m || detectSiteMode()

  if (mode === "chrryDev") {
    return {
      mode: "chrryDev",
      name: "Chrry",
      domain: "chrry.dev",
      description:
        "A modern, cross-platform UI library for React, React Native, and Next.js",
      logo: "/assets/cherry-logo.svg", // Cross-platform SVG
      primaryColor: "#E91E63", // Cherry pink
      links: {
        github: "https://github.com/AskVex/chrry",
        npm: "https://www.npmjs.com/package/@askvex/chrry",
        docs: "https://chrry.dev/docs",
        demo: "https://chrry.dev/demo",
      },
      features: [
        {
          title: "Pepper",
          description: "Universal router with view transitions",
          icon: "🌶️",
          link: "https://npmjs.com/package/@askvex/pepper",
          isOpenSource: true,
        },
        {
          title: "Components",
          description: "50+ production-ready UI components",
          icon: "🎨",
          link: "https://github.com/AskVex/chrry",
          isOpenSource: true,
        },

        {
          title: "Icons",
          description: "Cross-platform icon system with Lucide",
          icon: "✨",
          link: "https://github.com/AskVex/chrry/tree/main/icons",
          isOpenSource: true,
        },
        {
          title: "Styles",
          description: "SCSS to TypeScript converter",
          icon: "🎭",
          link: "https://github.com/AskVex/chrry/tree/main/styles",
          isOpenSource: true,
        },
        {
          title: "Hooks",
          description: "Reusable React hooks",
          icon: "🪝",
          link: "https://github.com/AskVex/chrry/tree/main/hooks",
          isOpenSource: true,
        },
        {
          title: "Context",
          description: "State management providers",
          icon: "🔄",
          link: "https://github.com/AskVex/chrry/tree/main/context",
          isOpenSource: true,
        },
        {
          title: "Platform",
          description: "Cross-platform utilities",
          icon: "📱",
          link: "https://github.com/AskVex/chrry/tree/main/platform",
          isOpenSource: true,
        },
        {
          title: "Waffles",
          description: "Playwright testing utilities",
          icon: "🧇",
          link: "https://npmjs.com/package/@askvex/waffles",
          isOpenSource: true,
        },
      ],
    }
  }

  if (mode === "chrryAI") {
    return {
      mode: "chrryAI",
      name: "Chrry AI",
      domain: "chrry.ai",
      description:
        "The AI App Marketplace - Discover, create, and monetize AI apps",
      logo: "🍒",
      primaryColor: "#E91E63", // Cherry pink
      links: {
        github: "https://github.com/AskVex/chrry",
        docs: "https://chrry.ai/docs",
        store: "https://chrry.store",
      },
      features: [
        {
          title: "App Marketplace",
          description: "Discover and install AI apps",
          icon: "🏪",
          link: "/explore",
          isOpenSource: false,
        },
        {
          title: "Create Stores",
          description: "Build your own AI app marketplace",
          icon: "🏗️",
          link: "/stores/new",
          isOpenSource: false,
        },
        {
          title: "Publish Apps",
          description: "Monetize your AI applications",
          icon: "📱",
          link: "/apps/new",
          isOpenSource: false,
        },
        {
          title: "Revenue Sharing",
          description: "Earn 70% on every sale",
          icon: "💰",
          link: "/affiliate",
          isOpenSource: false,
        },
        {
          title: "Custom Domains",
          description: "White-label your store",
          icon: "🌐",
          link: "/settings/domain",
          isOpenSource: false,
        },
        {
          title: "Analytics",
          description: "Track your app performance",
          icon: "📊",
          link: "/analytics",
          isOpenSource: false,
        },
        {
          title: "Multi-Agent Support",
          description: "Build for any AI platform",
          icon: "🤖",
          link: "/docs/agents",
          isOpenSource: false,
        },
        {
          title: "Developer Tools",
          description: "APIs and SDKs for developers",
          icon: "🛠️",
          link: "/docs/api",
          isOpenSource: false,
        },
      ],
    }
  }

  // Vex configuration
  return {
    mode: "vex",
    name: "Vex",
    domain: "askvex.com",
    description: "AI assistant that helps you get things done",
    logo: "🤖",
    primaryColor: "#6366F1", // Indigo
    links: {
      github: "https://github.com/AskVex",
      docs: "https://askvex.com/docs",
    },
    features: [
      {
        title: "LifeOS",
        description: "AI-powered life management system",
        icon: "🧠",
        link: "/lifeOS",
        isOpenSource: false,
      },
      {
        title: "AI Agents",
        description: "Custom AI agents for any task",
        icon: "🤖",
        link: "/lifeOS",
        isOpenSource: false,
      },
      {
        title: "Collaboration",
        description: "Real-time AI collaboration",
        icon: "👥",
        link: "/threads",
        isOpenSource: false,
      },
      {
        title: "Browser Extension",
        description: "AI assistant in your browser",
        icon: "🔌",
        link: "https://chrome.google.com/webstore",
        isOpenSource: false,
      },
    ],
  }
}

/**
 * Check if current site is Chrry
 */
export function isChrryDevMode(): boolean {
  return detectSiteMode() === "chrryDev"
}

/**
 * Check if current site is Vex
 */
export function isVexMode(): boolean {
  return detectSiteMode() === "vex"
}
