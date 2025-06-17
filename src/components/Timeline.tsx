
import React from "react";
import TimelineWithFallback from "./TimelineWithFallback";
import TimelineErrorBoundary from "./TimelineErrorBoundary";

interface TimelineProps {
  user?: any;
}

const Timeline = ({ user }: TimelineProps) => {
  console.log('🏁 Timeline wrapper render - user:', user?.id);
  return (
    <TimelineErrorBoundary>
      <TimelineWithFallback user={user} />
    </TimelineErrorBoundary>
  );
};

export default Timeline;
