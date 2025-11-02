import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteChoreModal } from "./DeleteChoreModal";
import type { ChoreViewModel } from "@/types/daily-view.types";
import type { MemberDTO } from "@/types";

interface ChoreCardProps {
  chore: ChoreViewModel;
  members: MemberDTO[];
  onAssign?: () => void;
  onDelete?: () => void;
}

export function ChoreCard({ chore, members, onAssign, onDelete }: ChoreCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: "chore",
    item: { id: chore.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
    }
  };

  // Helper function to get time of day text
  const getTimeOfDayText = (timeOfDay: string) => {
    switch (timeOfDay) {
      case "morning":
        return "morning";
      case "afternoon":
        return "afternoon";
      case "evening":
        return "evening";
      case "night":
        return "night";
      default:
        return "";
    }
  };

  return (
    <Card
      ref={drag}
      className={`hover:shadow-md transition-shadow cursor-move border border-border bg-card ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{chore.catalogEmoji || "📋"}</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground truncate">
                {chore.catalogTitle}
                {chore.catalogTimeOfDay !== "any" && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({getTimeOfDayText(chore.catalogTimeOfDay)})
                  </span>
                )}
                {!chore.catalogPredefined && <span className="ml-1">✨</span>}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs truncate text-black">
                  {chore.catalogCategory}
                </Badge>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {chore.points} pts
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            {onAssign && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAssign}
                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="Assign chore"
              >
                👤
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete chore"
              >
                🗑️
              </Button>
            )}
          </div>
        </div>
        {chore.assigneeName && (
          <div className="flex items-center space-x-2 pt-3 border-t border-border mt-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground">
              {chore.assigneeName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground">{chore.assigneeName}</span>
          </div>
        )}
        {!chore.assigneeName && (
          <div className="flex items-center space-x-2 pt-3 border-t border-border mt-3">
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">?</span>
            </div>
            <span className="text-sm text-muted-foreground">Unassigned</span>
          </div>
        )}
      </CardContent>

      <DeleteChoreModal
        isOpen={isDeleteModalOpen}
        chore={chore}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </Card>
  );
}
