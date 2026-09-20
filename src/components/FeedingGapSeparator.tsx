import { formatAgoMinutes } from "@/lib/relativeTime";

/** Small, discreet reminder of how long baby went between two tétées. */
export default function FeedingGapSeparator({ minutes }: { minutes: number }) {
  return (
    <div className="py-1.5 text-center">
      <span className="text-[11px] italic text-text-muted">
        {formatAgoMinutes(minutes)} depuis la tétée précédente
      </span>
    </div>
  );
}
