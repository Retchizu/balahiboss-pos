export type Timesheet = {
  id: string;
  uid: string;
  status: "active" | "completed";
  date: string;
  duration: number;
  loginTime: string;
  logoutTime: string | null;
  reason: string;
  updatedAt: string;
};
