import { UserInfo } from "firebase/auth";

export type User = UserInfo & { role: string; rate: number };
