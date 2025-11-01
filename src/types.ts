/**
 * Global DTO & Command-Model types for Home Crew REST API
 * ------------------------------------------------------
 *  – All types are directly based on entities from Supabase
 *  – When modifying the schema, simply update the `src/db/database.types.ts` file, and DTOs will be recompiled
 */
// import type { Tables, Enums } from "@/db/database.types";

// Temporary types until database.types.ts is generated
type Tables<T extends string> = any;
type Enums<T extends string> = any;

/* -------------------------------------------------- *
 * Helpers
 * -------------------------------------------------- */
type UUID = string; // better readability for identifiers
type ISODate = string; // e.g., '2025-10-12'

/* -------------------------------------------------- *
 * 1. Profiles
 * -------------------------------------------------- */
type ProfileRow = Tables<"profiles">;

export type ProfileDTO = Pick<ProfileRow, "id" | "name" | "avatar_url" | "total_points"> & {
  email: string;
};

export interface UpdateProfileCmd {
  name: string;
  avatar_url?: string | null;
}

/* -------------------------------------------------- *
 * 2. Households & Members
 * -------------------------------------------------- */
type HouseholdRow = Tables<"households">;
type MemberRow = Tables<"household_members">;

export type HouseholdDTO = Pick<HouseholdRow, "id" | "name" | "timezone"> & {
  /** Current 6-digit PIN (only included for household administrators) */
  pin?: string;
};

export interface CreateHouseholdCmd {
  name: HouseholdRow["name"];
}

export interface CreateHouseholdDTO extends Pick<HouseholdRow, "id" | "name"> {
  /** 6-digit PIN sent back only once to the admin */
  pin: string;
}

export interface JoinHouseholdCmd {
  /** 6-digit household PIN */
  pin: string;
}

/** Member list item returned by GET /v1/members */
export interface MemberDTO extends Pick<MemberRow, "id" | "role" | "joined_at"> {
  user_id: UUID;
  name: ProfileRow["name"];
  avatar_url: ProfileRow["avatar_url"];
}

export interface UpdateMemberRoleCmd {
  role: Enums<"household_role">;
}

/* -------------------------------------------------- *
 * 3. Chore Catalog
 * -------------------------------------------------- */
type CatalogRow = Tables<"chores_catalog">;

export type CatalogItemDTO = Pick<
  CatalogRow,
  | "id"
  | "title"
  | "emoji"
  | "time_of_day"
  | "category"
  | "points"
  | "predefined"
  | "created_by_user_id"
  | "created_at"
  | "deleted_at"
>;

/**
 * Command model for adding a custom chore to the catalog (API POST /v1/catalog)
 * `time_of_day` and `emoji` are optional from the client – server will fill defaults.
 */
export interface CreateCatalogItemCmd {
  title: CatalogRow["title"];
  category: CatalogRow["category"];
  points: CatalogRow["points"];
  /** Defaults to `'any'` when omitted */
  time_of_day?: Enums<"time_of_day_type">;
  /** Optional visual indicator */
  emoji?: CatalogRow["emoji"];
}

export type UpdateCatalogItemCmd = Partial<CreateCatalogItemCmd>;

/* -------------------------------------------------- *
 * 4. Daily Chores
 * -------------------------------------------------- */
type DailyChoreRow = Tables<"daily_chores">;

export type DailyChoreDTO = Pick<
  DailyChoreRow,
  "id" | "date" | "time_of_day" | "status" | "assignee_id" | "points" | "chore_catalog_id"
> & {
  /** Derived / embedded catalog data (title, emoji, etc.) may be added later */
};

export interface CreateDailyChoreCmd {
  date: ISODate;
  chore_catalog_id: UUID;
  assignee_id?: UUID | null;
  time_of_day?: Enums<"time_of_day_type">;
}

export type UpdateDailyChoreCmd = Partial<Pick<DailyChoreRow, "status" | "assignee_id">>;

/* -------------------------------------------------- *
 * 5. Audit & Points (read-only)
 * -------------------------------------------------- */
type PointsRow = Tables<"points_events">;
type StatusLogRow = Tables<"chore_status_log">;

export type PointsEventDTO = Pick<PointsRow, "id" | "points" | "event_type" | "created_at" | "daily_chore_id">;

export type ChoreStatusLogDTO = Pick<
  StatusLogRow,
  | "id"
  | "daily_chore_id"
  | "previous_status"
  | "new_status"
  | "previous_assignee_id"
  | "new_assignee_id"
  | "points_delta"
  | "changed_by_user_id"
  | "created_at"
>;

/**
 * Options for filtering and pagination when retrieving user points events
 */
export interface GetPointsEventsOptions {
  cursor?: string;
  limit?: number;
  event_type?: Enums<"points_event_type">;
  from_date?: string;
  to_date?: string;
}

/* -------------------------------------------------- *
 * 6. Generic pagination wrapper
 * -------------------------------------------------- */
export interface Paginated<T> {
  data: T[];
  next_cursor?: string;
}
