"use client";

import { Fragment, useMemo } from "react";
import FeedingGapSeparator from "./FeedingGapSeparator";
import FeedingGroupBlock from "./FeedingGroupBlock";
import type { FeedingGroup } from "@/lib/feedingGrouping";
import type { FeedingSession } from "@/lib/types";

/**
 * Renders a day's tétées most-recent-first, with a discreet "Xh depuis la
 * tétée précédente" separator between consecutive groups. Gaps are only
 * ever computed within the groups passed in (one day's worth), so the
 * first/oldest tétée of a day never gets a gap pulled in from the day before.
 */
export default function FeedingGroupList({
  groups,
  sessions,
}: {
  groups: FeedingGroup[]; // ascending order
  sessions: FeedingSession[];
}) {
  const groupsDesc = useMemo(() => [...groups].reverse(), [groups]);

  return (
    <>
      {groupsDesc.map((g, i) => {
        const older = groupsDesc[i + 1];
        const gapMinutes = older
          ? (new Date(g.startTime).getTime() - new Date(older.endTime).getTime()) / 60000
          : null;
        return (
          <Fragment key={g.number}>
            <FeedingGroupBlock group={g} sessions={sessions} />
            {gapMinutes !== null && gapMinutes >= 0 && <FeedingGapSeparator minutes={gapMinutes} />}
          </Fragment>
        );
      })}
    </>
  );
}
