export type Timesheet = {
  id: string;
  uid: string;
  status: "active" | "completed";
  date: string;
  duration: number;
  loginTime: Date;
  logoutTime: Date | null;
  reason: string;
  updatedAt: Date;
};
