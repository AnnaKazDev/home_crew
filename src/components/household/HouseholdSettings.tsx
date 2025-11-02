import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { HouseholdDTO, UpdateHouseholdCmd } from "@/types";

interface HouseholdSettingsProps {
  household: HouseholdDTO;
  currentUserRole: "admin" | "member";
  onUpdate: (updates: UpdateHouseholdCmd) => Promise<void>;
  isUpdating: boolean;
  className?: string;
}

const HouseholdSettings: React.FC<HouseholdSettingsProps> = ({ household, onUpdate, isUpdating, className = "" }) => {
  const [name, setName] = useState(household.name);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();

    // Client-side validation: check if name changed
    if (trimmedName === household.name) {
      setIsEditing(false);
      return;
    }

    // Client-side validation: name length
    if (trimmedName.length < 3) {
      toast.error("Household name must be at least 3 characters long");
      return;
    }

    if (trimmedName.length > 100) {
      toast.error("Household name must be 100 characters or less");
      return;
    }

    // Client-side validation: only admins can update household
    if (currentUserRole !== "admin") {
      toast.error("Only administrators can update household settings");
      return;
    }

    try {
      await onUpdate({ name: trimmedName });
      setIsEditing(false);
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

  const handleCancel = () => {
    setName(household.name);
    setIsEditing(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Household Settings</CardTitle>
        <CardDescription>Update your household information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Household Name */}
        <div className="space-y-2">
          <Label htmlFor="household-name">Household Name</Label>
          {isEditing ? (
            <div className="space-y-3">
              <Input
                id="household-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter household name"
                disabled={isUpdating}
                maxLength={100}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isUpdating || !name.trim()} size="sm">
                  {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isUpdating} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm">{household.name}</span>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">{name.length}/100 characters</p>
        </div>

        {/* Additional settings can be added here in the future */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">More household settings will be available in future updates.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseholdSettings;
