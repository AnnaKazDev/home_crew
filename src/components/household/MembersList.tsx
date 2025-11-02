import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MemberCard from "./MemberCard";
import type { MemberDTO } from "@/types";

interface MembersListProps {
  members: MemberDTO[];
  currentUserRole: "admin" | "member";
  currentUserId: string;
  onUpdateRole: (memberId: string, role: "admin" | "member") => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  isUpdating: boolean;
  className?: string;
}

const MembersList: React.FC<MembersListProps> = ({
  members,
  currentUserRole,
  currentUserId,
  onUpdateRole,
  onRemoveMember,
  isUpdating,
  className = "",
}) => {
  const sortedMembers = [...members].sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Household Members
          <Badge variant="outline">{members.length} members</Badge>
        </CardTitle>
        <CardDescription>
          {currentUserRole === "admin" ? "Manage household members and their roles" : "View household members"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No members found</div>
        ) : (
          <div className="space-y-4">
            {sortedMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                currentUserRole={currentUserRole}
                currentUserId={currentUserId}
                onUpdateRole={(role) => onUpdateRole(member.id, role)}
                onRemove={() => onRemoveMember(member.id)}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembersList;
