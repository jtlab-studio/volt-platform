interface Environment {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

export const env: Environment = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export function validateEnvironment(): void {
  const required = ['supabaseUrl', 'supabaseAnonKey'] as const;
  
  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
