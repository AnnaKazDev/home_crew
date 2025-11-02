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
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Household Members</h2>
        <Badge variant="outline">{members.length} members</Badge>
      </div>
      <p className="text-sm text-muted-foreground dark:text-gray-300 mb-6">
        {currentUserRole === "admin" ? "Manage household members and their roles" : "View household members"}
      </p>
      {sortedMembers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground dark:text-gray-400">No members found</div>
      ) : (
        <div className="space-y-6">
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
    </div>
  );
};

export default MembersList;
