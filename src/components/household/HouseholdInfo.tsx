import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import type { HouseholdDTO } from "@/types";

interface HouseholdInfoProps {
  household: HouseholdDTO;
  currentUserRole: "admin" | "member";
  className?: string;
}

const HouseholdInfo: React.FC<HouseholdInfoProps> = memo(({ household, currentUserRole, className = "" }) => {
  const [showPin, setShowPin] = useState(false);

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

  return (
    <Card className={`${className} transition-all hover:shadow-lg duration-300 animate-in fade-in-0 slide-in-from-bottom-2`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Household Information
          <Badge
            variant={currentUserRole === "admin" ? "default" : "secondary"}
            className="animate-in fade-in-0 zoom-in-95 duration-300 delay-200"
          >
            {currentUserRole}
          </Badge>
        </CardTitle>
        <CardDescription>Basic information about your household</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Household Name */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">Household Name</label>
          <p className="text-lg font-semibold mt-1">{household.name}</p>
        </div>

        {/* Household PIN - Admin only */}
        {currentUserRole === "admin" && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Household PIN</label>
            <div className="flex items-center gap-2 mt-1 animate-in fade-in-0 slide-in-from-right-2 duration-300 delay-300">
              <code className="text-lg font-mono bg-muted px-3 py-1 rounded transition-all duration-200">
                {showPin ? household.pin : "••••••"}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                className="transition-all hover:scale-105 duration-200"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPin}
                aria-label="Copy PIN to clipboard"
                className="transition-all hover:scale-105 duration-200"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Share this PIN with family members to join your household
            </p>
          </div>
        )}

        {/* Household Timezone */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">Timezone</label>
          <p className="text-sm mt-1">{household.timezone}</p>
        </div>
      </CardContent>
    </Card>
  );
});

export default HouseholdInfo;
