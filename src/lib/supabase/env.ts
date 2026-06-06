export function getSupabaseAuthEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith("http")) return null;
  } catch {
    return null;
  }

  if (!anonKey || anonKey === '""' || anonKey === "''") return null;
  return { url, anonKey };
}

export function hasSupabaseAuthEnv() {
  return Boolean(getSupabaseAuthEnv());
}
