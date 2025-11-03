import React from "react";
import { useDrop } from "react-dnd";
import { ChoreCard } from "./ChoreCard";
import { ChoreCardSkeleton } from "./ChoreCardSkeleton";
import { AddChoreButton } from "./AddChoreButton";
import type { ChoreViewModel } from "@/types/daily-view.types";
import type { MemberDTO } from "@/types";

interface ChoreColumnProps {
  title: string;
  status: "todo" | "done";
  chores: ChoreViewModel[];
  members: MemberDTO[];
  isLoading?: boolean;
  onDrop: (choreId: string) => void;
  onChoreAssign?: (chore: ChoreViewModel) => void;
  onChoreDelete?: (choreId: string) => void;
  onAddChoreClick?: () => void;
}

export function ChoreColumn({
  title,
  status,
  chores,
  members,
  isLoading = false,
  onDrop,
  onChoreAssign,
  onChoreDelete,
  onAddChoreClick,
}: ChoreColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: "chore",
    drop: (item: { id: string }) => {
      onDrop(item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`bg-card p-6 rounded-lg shadow min-h-[400px] transition-colors ${
        isOver ? "bg-accent border-2 border-dashed border-accent" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4 min-h-[40px]">
        <h2 className={`text-lg font-semibold ${status === "todo" ? "text-primary" : "text-primary"}`}>
          {title} ({chores.length})
        </h2>
        {status === "todo" && onAddChoreClick && <AddChoreButton onClick={onAddChoreClick} />}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Show skeleton cards when loading
          Array.from({ length: 3 }).map((_, index) => <ChoreCardSkeleton key={`skeleton-${index}`} />)
        ) : (
          // Show actual cards when loaded
          <>
            {chores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                members={members}
                onAssign={onChoreAssign ? () => onChoreAssign(chore) : undefined}
                onDelete={onChoreDelete ? () => onChoreDelete(chore.id) : undefined}
              />
            ))}

            {chores.length === 0 && (
              <div
                className={`flex flex-col items-center justify-center h-[133px] text-muted-foreground border-2 border-dashed rounded-lg ${
                  isOver ? "border-accent bg-accent/50" : "border-border"
                }`}
              >
                <p className="text-muted-foreground">
                  {status === "todo" ? "No tasks to do!" : "No completed chores yet"}
                </p>
                {status === "done" && <p className="text-sm text-muted-foreground mt-1">Drag chores here when done!</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
