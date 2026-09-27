/**
 * Maps provider types to their specific documentation URLs
 */

const BASE_DOCS_URL = 'https://github.com/NETIZEN-11/ARTF/blob/main/README.md';

/**
 * Provider type to documentation URL mapping
 * Falls back to the general providers documentation if no specific docs exist
 */
export const PROVIDER_DOCUMENTATION_MAP: Record<string, string> = {
  // API Endpoints
  a2a: `${BASE_DOCS_URL}`,
  http: `${BASE_DOCS_URL}`,
  websocket: `${BASE_DOCS_URL}`,

  // Code-based Providers
  javascript: `${BASE_DOCS_URL}`,
  python: `${BASE_DOCS_URL}`,
  go: `${BASE_DOCS_URL}`,
  mcp: `${BASE_DOCS_URL}`,
  browser: `${BASE_DOCS_URL}`,
  exec: `${BASE_DOCS_URL}`,
  custom: `${BASE_DOCS_URL}`, // General providers page

  // Agent Frameworks
  'claude-agent-sdk': `${BASE_DOCS_URL}`,
  'codex-security': `${BASE_DOCS_URL}`,
  openinterpreter: `${BASE_DOCS_URL}`,
  'openai-agents-sdk': `${BASE_DOCS_URL}`,
  'bedrock-agent': `${BASE_DOCS_URL}`,
  langchain: `${BASE_DOCS_URL}`,
  langgraph: `${BASE_DOCS_URL}`,
  crewai: `${BASE_DOCS_URL}`,
  autogen: `${BASE_DOCS_URL}`,
  'pydantic-ai': `${BASE_DOCS_URL}`,
  llamaindex: `${BASE_DOCS_URL}`,
  'google-adk': `${BASE_DOCS_URL}`,
  'generic-agent': `${BASE_DOCS_URL}`,

  // Foundation Models
  openai: `${BASE_DOCS_URL}`,
  anthropic: `${BASE_DOCS_URL}`,
  google: `${BASE_DOCS_URL}`,
  vertex: `${BASE_DOCS_URL}`,
  azure: `${BASE_DOCS_URL}`,
  mistral: `${BASE_DOCS_URL}`,
  groq: `${BASE_DOCS_URL}`,
  perplexity: `${BASE_DOCS_URL}`,
  deepseek: `${BASE_DOCS_URL}`,
  xai: `${BASE_DOCS_URL}`,

  // Cloud & Enterprise
  bedrock: `${BASE_DOCS_URL}`,
  'aws-bedrock': `${BASE_DOCS_URL}`,
  sagemaker: `${BASE_DOCS_URL}`,
  databricks: `${BASE_DOCS_URL}`,
  'cloudflare-ai': `${BASE_DOCS_URL}`,
  huggingface: `${BASE_DOCS_URL}`,
  helicone: `${BASE_DOCS_URL}`,
  jfrog: `${BASE_DOCS_URL}`,

  // Third-Party Providers
  openrouter: `${BASE_DOCS_URL}`,
  github: `${BASE_DOCS_URL}`,
  ai21: `${BASE_DOCS_URL}`,
  aimlapi: `${BASE_DOCS_URL}`,
  hyperbolic: `${BASE_DOCS_URL}`,
  fal: `${BASE_DOCS_URL}`,
  voyage: `${BASE_DOCS_URL}`,

  // Local Models
  ollama: `${BASE_DOCS_URL}`,
  vllm: `${BASE_DOCS_URL}`,
  localai: `${BASE_DOCS_URL}`,
  llamafile: `${BASE_DOCS_URL}`,
  'llama.cpp': `${BASE_DOCS_URL}`,
  'text-generation-webui': `${BASE_DOCS_URL}`,

  // Additional providers found in docs
  alibaba: `${BASE_DOCS_URL}`,
  cerebras: `${BASE_DOCS_URL}`,
  cloudera: `${BASE_DOCS_URL}`,
  cohere: `${BASE_DOCS_URL}`,
  docker: `${BASE_DOCS_URL}`,
  echo: `${BASE_DOCS_URL}`,
  f5: `${BASE_DOCS_URL}`,
  fireworks: `${BASE_DOCS_URL}`,
  litellm: `${BASE_DOCS_URL}`,
  openllm: `${BASE_DOCS_URL}`,
  replicate: `${BASE_DOCS_URL}`,
  sequence: `${BASE_DOCS_URL}`,
  'simulated-user': `${BASE_DOCS_URL}`,
  togetherai: `${BASE_DOCS_URL}`,
  together: `${BASE_DOCS_URL}`,
  watsonx: `${BASE_DOCS_URL}`,
  webhook: `${BASE_DOCS_URL}`,
  'manual-input': `${BASE_DOCS_URL}`,
};

/**
 * Gets the documentation URL for a given provider type
 * @param providerType The provider type (e.g., 'openai', 'http', 'python')
 * @returns The documentation URL for the provider, or general providers docs if not found
 */
export function getProviderDocumentationUrl(providerType?: string): string {
  if (!providerType) {
    return BASE_DOCS_URL;
  }

  // Handle provider formats like 'openrouter:openai/gpt-5.4' or 'azure:chat:'
  const normalizedType =
    providerType === 'openai:codex-security' || providerType.startsWith('openai:codex-security:')
      ? 'codex-security'
      : providerType.includes(':')
        ? providerType.split(':')[0]
        : providerType;

  return PROVIDER_DOCUMENTATION_MAP[normalizedType] || BASE_DOCS_URL;
}

/**
 * Checks if a provider has specific documentation
 * @param providerType The provider type to check
 * @returns true if specific documentation exists, false otherwise
 */
export function hasSpecificDocumentation(providerType?: string): boolean {
  if (!providerType) {
    return false;
  }

  return providerType in PROVIDER_DOCUMENTATION_MAP;
}
