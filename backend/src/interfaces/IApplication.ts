import IBase from "./IBase";
import { IUser, ITuitionPost } from "@interfaces";

interface ITuitionApplication extends IBase {
  applicant: IUser;
  tuitionPost: ITuitionPost;
  status: "pending" | "accepted" | "rejected";
  coverLetter: string;
  expectedPay?: number;
  availableTimeSlots: string[];
  yearsOfExperience?: number;
  qualifications?: string[];
  preferredMode?: "online" | "offline" | "hybrid";
  additionalNotes?: string;
}

interface ICreateTuitionApplicationInput {
  coverLetter: string;
  expectedPay?: number;
  availableTimeSlots: string[];
  yearsOfExperience?: number;
  qualifications?: string[];
  preferredMode?: "online" | "offline" | "hybrid";
  additionalNotes?: string;
}

export type {
  ITuitionApplication,
  ICreateTuitionApplicationInput
}