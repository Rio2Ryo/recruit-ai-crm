function clean(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === '""' || trimmed === "''") return "";
  return trimmed;
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function deriveSupabaseUrlFromDatabaseUrl() {
  const databaseUrl = clean(process.env.DATABASE_URL);
  if (!databaseUrl) return "";

  try {
    const parsed = new URL(databaseUrl);
    const dbHostMatch = parsed.hostname.match(/^db\.([a-z0-9-]+)\.supabase\.co$/i);
    if (dbHostMatch?.[1]) return `https://${dbHostMatch[1]}.supabase.co`;

    const usernameMatch = decodeURIComponent(parsed.username).match(/postgres\.([a-z0-9-]+)/i);
    if (usernameMatch?.[1]) return `https://${usernameMatch[1]}.supabase.co`;
  } catch {
    return "";
  }

  return "";
}

export function getSupabaseAuthEnv() {
  const urlCandidates = [
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    clean(process.env.SUPABASE_URL),
    deriveSupabaseUrlFromDatabaseUrl(),
  ];
  const anonKeyCandidates = [
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    clean(process.env.SUPABASE_ANON_KEY),
    clean(process.env.SUPABASE_PUBLISHABLE_KEY),
    // NOTE: service-role keys intentionally excluded — using one as an anon key would
    // grant every OAuth user full DB access.
  ];

  const url = urlCandidates.find(isHttpUrl) ?? "";
  const anonKey = anonKeyCandidates.find(Boolean) ?? "";

  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function hasSupabaseAuthEnv() {
  return Boolean(getSupabaseAuthEnv());
}
