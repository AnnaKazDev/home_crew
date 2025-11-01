import React from "react";
import { Badge } from "@/components/ui/badge";

interface PointsDisplayProps {
  points: number;
}

const PointsDisplay: React.FC<PointsDisplayProps> = React.memo(({ points }) => {
  return (
    <div className="mt-8 bg-card rounded-lg border p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">Points</h2>
      <Badge variant="secondary" className="text-lg">
        {points} points
      </Badge>
    </div>
  );
});

PointsDisplay.displayName = "PointsDisplay";

export default PointsDisplay;
