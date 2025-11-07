import type { DailyChoreDTO, MemberDTO, HouseholdDTO } from "@/types";

/**
 * ViewModel types for Daily Chores View
 * Extends base DTOs with additional UI-specific properties
 */

export interface ChoreViewModel extends DailyChoreDTO {
  /** Title from catalog */
  catalogTitle: string;
  /** Emoji from catalog */
  catalogEmoji?: string;
  /** Category from catalog */
  catalogCategory: string;
  /** Time of day from catalog */
  catalogTimeOfDay: "morning" | "afternoon" | "evening" | "any";
  /** Whether this is a predefined chore or custom */
  catalogPredefined: boolean;
  /** Name of assigned member */
  assigneeName?: string;
  /** Avatar URL of assigned member */
  assigneeAvatar?: string;
  /** Whether current user can edit (assignee or admin) */
  canEdit: boolean;
  /** Whether current user can delete (creator or admin) */
  canDelete: boolean;
}

export interface DailyViewState {
  /** Currently selected date */
  currentDate: string; // ISODate
  /** List of chores for current date */
  chores: ChoreViewModel[];
  /** Household members */
  members: MemberDTO[];
  /** Current household */
  household: HouseholdDTO;
  /** Current user ID */
  currentUserId: string; // UUID
  /** Modal states */
  isAddModalOpen: boolean;
  isAssignModalOpen: boolean;
  /** Selected chore for assign modal */
  selectedChore: ChoreViewModel | null;
  /** Loading and error states */
  isLoading: boolean;
  error: string | null;
}

/**
 * Props interfaces for components
 */

export interface DailyViewHeaderProps {
  currentDate: string;
  totalPoints: number;
  choresCount: number;
  onDateChange: (date: string) => void;
  onAddChoreClick: () => void;
}

export interface ChoreColumnsProps {
  chores: ChoreViewModel[];
  members: MemberDTO[];
  currentUserId: string;
  onChoreUpdate: (id: string, updates: any) => void;
  onChoreClick: (chore: ChoreViewModel) => void;
}

export interface ChoreColumnProps {
  title: string;
  status: "todo" | "done";
  chores: ChoreViewModel[];
  members: MemberDTO[];
  onDrop: (choreId: string) => void;
  onChoreClick: (chore: ChoreViewModel) => void;
}

export interface ChoreCardProps {
  chore: ChoreViewModel;
  assignee: MemberDTO | null;
  onAssign: () => void;
  onDelete: () => void;
}

export interface DateNavigatorProps {
  currentDate: string;
  onDateChange: (date: string) => void;
}

export interface AddChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cmd: any) => void; // CreateDailyChoreCmd
  members: MemberDTO[];
}

export interface AssignChoreModalProps {
  isOpen: boolean;
  chore: ChoreViewModel | null;
  members: MemberDTO[];
  currentUserId?: string;
  onClose: () => void;
  onSubmit: (assigneeId: string | null) => void;
}
