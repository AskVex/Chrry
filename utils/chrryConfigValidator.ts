/**
 * Chrry Config Validator
 * Validates chrry.config.js files and provides helpful error messages
 */

import { validateChrryConfig, type ChrryConfig } from "../schemas/chrryConfig"
import { z } from "zod"

/**
 * Validation result with detailed errors
 */
export interface ValidationResult {
  valid: boolean
  config?: ChrryConfig
  errors?: ValidationError[]
  warnings?: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

/**
 * Validate a Chrry config file
 */
export function validateConfig(config: unknown): ValidationResult {
  const result = validateChrryConfig(config)

  if (result.success && result.data) {
    const warnings = generateWarnings(result.data)
    return {
      valid: true,
      config: result.data,
      warnings,
    }
  }

  if (result.errors) {
    const errors = formatZodErrors(result.errors)
    return {
      valid: false,
      errors,
    }
  }

  return {
    valid: false,
    errors: [
      {
        field: "unknown",
        message: "Unknown validation error",
        code: "UNKNOWN_ERROR",
      },
    ],
  }
}

/**
 * Format Zod errors into user-friendly messages
 */
function formatZodErrors(zodError: z.ZodError): ValidationError[] {
  return zodError.issues.map((error) => {
    const field = error.path.join(".")
    const message = error.message

    return {
      field,
      message: `${field}: ${message}`,
      code: error.code,
    }
  })
}

/**
 * Generate warnings for potential issues
 */
function generateWarnings(config: ChrryConfig): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  // Check bundle size
  const bundleSize = parseBundleSize(config.build.bundleSize)
  if (bundleSize > 1024 * 1024) {
    // > 1MB
    warnings.push({
      field: "build.bundleSize",
      message: "Bundle size is larger than 1MB",
      suggestion: "Consider code splitting or removing unused dependencies",
    })
  }

  // Check if native platforms are enabled but no native entry point
  if (
    (config.platforms.ios || config.platforms.android) &&
    !config.entry.native
  ) {
    warnings.push({
      field: "entry.native",
      message: "Native platforms enabled but no native entry point specified",
      suggestion: "Add entry.native: './src/index.native.tsx'",
    })
  }

  // Check if desktop platform is enabled but no desktop entry point
  if (config.platforms.desktop && !config.entry.desktop) {
    warnings.push({
      field: "entry.desktop",
      message: "Desktop platform enabled but no desktop entry point specified",
      suggestion: "Add entry.desktop: './src/index.desktop.tsx'",
    })
  }

  // Check permissions
  if (config.permissions.length === 0) {
    warnings.push({
      field: "permissions",
      message: "No permissions specified",
      suggestion: "Add required permissions like 'location', 'camera', etc.",
    })
  }

  // Check if paid app but no pricing info
  if (config.pricing.model !== "free" && !config.pricing.price) {
    warnings.push({
      field: "pricing.price",
      message: "Pricing model is not free but no price specified",
      suggestion: "Add pricing.price: 4.99",
    })
  }

  // Check screenshots
  if (config.screenshots.length === 0) {
    warnings.push({
      field: "screenshots",
      message: "No screenshots provided",
      suggestion: "Add screenshots to improve app discoverability",
    })
  }

  // Check keywords
  if (config.keywords.length === 0) {
    warnings.push({
      field: "keywords",
      message: "No keywords specified",
      suggestion: "Add keywords to improve search ranking",
    })
  }

  return warnings
}

/**
 * Parse bundle size string to bytes
 */
function parseBundleSize(size: string): number {
  const match = size.match(/^(\d+(?:\.\d+)?)(KB|MB|GB)?$/i)
  if (!match) return 0

  const value = parseFloat(match[1]!)
  const unit = (match[2] || "B").toUpperCase()

  switch (unit) {
    case "KB":
      return value * 1024
    case "MB":
      return value * 1024 * 1024
    case "GB":
      return value * 1024 * 1024 * 1024
    default:
      return value
  }
}

/**
 * Check if config file exists and is valid
 */
export async function loadAndValidateConfig(
  configPath: string,
): Promise<ValidationResult> {
  try {
    // Dynamic import of config file
    const configModule = await import(configPath)
    const config = configModule.default || configModule

    return validateConfig(config)
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          field: "file",
          message: `Failed to load config file: ${error instanceof Error ? error.message : "Unknown error"}`,
          code: "FILE_LOAD_ERROR",
        },
      ],
    }
  }
}

/**
 * Pretty print validation results
 */
export function printValidationResults(result: ValidationResult): void {
  if (result.valid) {
    console.log("✅ Config is valid!")

    if (result.warnings && result.warnings.length > 0) {
      console.log("\n⚠️  Warnings:")
      result.warnings.forEach((warning) => {
        console.log(`  - ${warning.message}`)
        if (warning.suggestion) {
          console.log(`    💡 ${warning.suggestion}`)
        }
      })
    }
  } else {
    console.log("❌ Config validation failed!\n")

    if (result.errors) {
      console.log("Errors:")
      result.errors.forEach((error) => {
        console.log(`  - ${error.message}`)
      })
    }
  }
}

/**
 * Generate a template config file
 */
export function generateTemplateConfig(
  appName: string,
  slug: string,
): ChrryConfig {
  return {
    name: appName,
    slug: slug,
    version: "1.0.0",
    icon: "🚀",
    description: `${appName} - Built with Chrry`,
    author: {
      name: "Your Name",
      email: "you@example.com",
    },
    license: "MIT",
    category: "other",
    keywords: [],

    platforms: {
      web: true,
      ios: false,
      android: false,
      desktop: false,
    },

    entry: {
      web: "./src/index.web.tsx",
    },

    permissions: [],

    dependencies: {
      chrry: "^1.0.0",
    },

    build: {
      bundleSize: "500KB",
      minify: true,
      sourceMaps: false,
      target: "es2020",
    },

    github: {
      org: "chrry-apps",
      repo: slug,
      branch: "main",
      autoPublish: true,
    },

    validation: {
      maxBundleSize: "1MB",
      requiredFiles: ["index.js", "manifest.json"],
      securityScan: true,
      codeReview: "auto",
    },

    pricing: {
      model: "free",
      currency: "USD",
    },
    screenshots: [],
  }
}
