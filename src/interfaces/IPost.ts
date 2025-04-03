import IBase from "./IBase";
import IUser from "./IUser";

export default interface ITuitionPost extends IBase {
    description: string;
    preferredTimeSlots: string[];
    pay: number;
    payType: 'fixed' | 'negotiable';
    mode: 'online' | 'offline' | 'hybrid';
    residingLocation: string;
    grade: string;
    subject: string[];
    tuitionLocation: string;
    areaRange: string;
    expiryDate: Date;
    posted_by: IUser;
    tutorRequirements?: string[];
    sessionFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'flexible';
    tutorGenderPreference?: 'male' | 'female' | 'any';
    isActive: boolean;
    numberOfStudents: number;
    additionalNotes?: string;
}