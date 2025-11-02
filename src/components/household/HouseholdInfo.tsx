import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { HouseholdDTO, UpdateHouseholdCmd } from "@/types";

interface HouseholdInfoProps {
  household: HouseholdDTO;
  currentUserRole: "admin" | "member";
  onUpdate?: (updates: UpdateHouseholdCmd) => Promise<void>;
  isUpdating?: boolean;
  className?: string;
}

const HouseholdInfo: React.FC<HouseholdInfoProps> = memo(({ household, currentUserRole, onUpdate, isUpdating = false, className = "" }) => {
  const [showPin, setShowPin] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(household.name);

  const handleCopyPin = async () => {
    if (household.pin) {
      try {
        await navigator.clipboard.writeText(household.pin);
        toast.success("PIN copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy PIN");
      }
    }
  };

  const handleSaveName = async () => {
    if (!onUpdate) return;

    const trimmedName = name.trim();
    if (trimmedName === household.name) {
      setIsEditingName(false);
      return;
    }

    if (trimmedName.length === 0) {
      toast.error("Household name cannot be empty");
      return;
    }

    if (trimmedName.length > 100) {
      toast.error("Household name cannot be longer than 100 characters");
      return;
    }

    try {
      await onUpdate({ name: trimmedName });
      setIsEditingName(false);
      toast.success("Household name updated successfully");
    } catch (error) {
      toast.error("Failed to update household name");
    }
  };

  const handleCancelEdit = () => {
    setName(household.name);
    setIsEditingName(false);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-foreground">Household Information</h2>
        <Badge
          variant={currentUserRole === "admin" ? "default" : "secondary"}
        >
          {currentUserRole}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Basic information about your household</p>
      <div className="space-y-6">
        {/* Household Name */}
        <div>
          <label className="text-sm font-medium text-muted-foreground dark:text-gray-300">Household Name</label>
          <div className="mt-2">
            {isEditingName && currentUserRole === "admin" && onUpdate ? (
              <div className="w-full space-y-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter household name"
                  disabled={isUpdating}
                  maxLength={100}
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="px-4 py-2 text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isUpdating || !name.trim()}
                    className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isUpdating ? "animate-shimmer" : ""
                    }`}
                  >
                    {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save
                  </button>
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">{name.length}/100 characters</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold dark:text-white dark:text-blue-100">{household.name}</p>
                {currentUserRole === "admin" && onUpdate && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="px-4 py-2 text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Household PIN - Admin only */}
        {currentUserRole === "admin" && (
          <div>
            <label className="text-sm font-medium text-muted-foreground dark:text-gray-300">Household PIN</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-lg font-mono bg-muted px-3 py-1 rounded transition-all duration-200 dark:bg-gray-700 dark:text-white">
                {showPin ? household.pin : "••••••"}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                className="hover:scale-105 duration-200"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPin}
                aria-label="Copy PIN to clipboard"
                className="hover:scale-105 duration-200"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Share this PIN with family members to join your household
            </p>
          </div>
        )}

      </div>
    </div>
  );
});

export default HouseholdInfo;
