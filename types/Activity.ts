export type ActivityAction = "CREATE" | "UPDATE" | "DELETE";
export type ActivityEntity = "transaction" | "product" | "customer";

// A single field change (before → after)
export type FieldChange = {
  before: unknown | null;
  after: unknown | null;
};

// Whole activity log entry
type Activity = {
  id: string; // unique log id (e.g., UUID or backend ID)
  action: ActivityAction;
  entity: ActivityEntity;
  entityId: string; // which record was changed
  changes: Record<string, FieldChange> | null;  // flexible keys
  userId: string; // who performed the action
  displayName: string;
  date: string; // ISO date
};

// Dictionary of logs (id → log)
export type ActivityLog  = Activity[];

export default Activity;
