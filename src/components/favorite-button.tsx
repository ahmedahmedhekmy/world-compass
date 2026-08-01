import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({ slug, label }: { slug: string; label: string }) {
  const { isFavorite, toggle, signedIn } = useFavorites();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={() => {
        if (!signedIn) {
          toast.info("سجّل الدخول لحفظ الوجهات المفضلة.");
          return;
        }
        toggle.mutate(slug);
      }}
      aria-pressed={active}
      aria-label={active ? `إزالة ${label} من المفضلة` : `حفظ ${label} في المفضلة`}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-secondary"
    >
      <Heart className={"size-4 " + (active ? "fill-primary text-primary" : "")} aria-hidden />
      {active ? "محفوظة" : "حفظ الوجهة"}
    </button>
  );
}
