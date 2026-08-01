import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const RECENT_KEY = "tsb:recent-countries";

/** Saved (favorite) countries for the signed-in traveller. */
export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("country_slug")
        .order("created_at", { ascending: false });
      return (data ?? []).map((r) => r.country_slug);
    },
  });

  const slugs = data ?? [];

  const toggle = useMutation({
    mutationFn: async (slug: string) => {
      if (!user) throw new Error("auth");
      if (slugs.includes(slug)) {
        await supabase.from("favorites").delete().eq("country_slug", slug).eq("user_id", user.id);
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, country_slug: slug });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites", user?.id] }),
  });

  return { slugs, isFavorite: (s: string) => slugs.includes(s), toggle, signedIn: Boolean(user) };
}

/** Recently viewed countries, kept locally on the device. */
export function pushRecentCountry(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const prev = readRecentCountries().filter((s) => s !== slug);
    localStorage.setItem(RECENT_KEY, JSON.stringify([slug, ...prev].slice(0, 12)));
  } catch {
    /* storage unavailable */
  }
}

export function readRecentCountries(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed.filter((x) => typeof x === "string") as string[]) : [];
  } catch {
    return [];
  }
}
