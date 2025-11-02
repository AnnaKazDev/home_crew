import { Card, CardContent } from "@/components/ui/card";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Shield, User } from "lucide-react";
import { toast } from "sonner";
import type { MemberDTO } from "@/types";

interface MemberCardProps {
  member: MemberDTO;
  currentUserRole: "admin" | "member";
  currentUserId: string;
  onUpdateRole: (role: "admin" | "member") => Promise<void>;
  onRemove: () => Promise<void>;
  isUpdating: boolean;
}

const MemberCard: React.FC<MemberCardProps> = memo(({
  member,
  currentUserRole,
  currentUserId,
  onUpdateRole,
  onRemove,
  isUpdating,
}) => {
  const isCurrentUser = member.user_id === currentUserId;
  const canModify = currentUserRole === "admin" && !isCurrentUser;

  const handleRoleChange = async (newRole: "admin" | "member") => {
    if (newRole === member.role) return;

    // Client-side validation: only admins can change roles
    if (currentUserRole !== "admin") {
      toast.error("Only administrators can change member roles");
      return;
    }

    // Client-side validation: cannot modify self
    if (isCurrentUser) {
      toast.error("You cannot change your own role");
      return;
    }

    try {
      await onUpdateRole(newRole);
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

  const handleRemove = async () => {
    // Client-side validation: only admins can remove members
    if (currentUserRole !== "admin") {
      toast.error("Only administrators can remove members");
      return;
    }

    // Client-side validation: cannot remove self
    if (isCurrentUser) {
      toast.error("You cannot remove yourself from the household");
      return;
    }

    try {
      await onRemove();
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatJoinedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="transition-all hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 duration-200 animate-in fade-in-0 slide-in-from-left-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 animate-in fade-in-0 slide-in-from-left-4 duration-300 delay-100">
            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>

            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{member.name}</h3>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                  {member.role === "admin" ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Member
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">Joined {formatJoinedDate(member.joined_at)}</span>
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          {canModify && (
            <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-right-4 duration-300 delay-200">
              {/* Role Selector */}
              <Select value={member.role} onValueChange={handleRoleChange} disabled={isUpdating}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Remove Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {member.name} from the household? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRemove}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default MemberCard;
