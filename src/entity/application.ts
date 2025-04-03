import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import {
    User,
    TuitionPost
} from '@entity';
import { ITuitionApplication } from '@interfaces';

@Entity('tuition_applications')
export default class TuitionApplication extends BaseEntity implements ITuitionApplication {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'applicant_id' })
    applicant!: User;

    @ManyToOne(() => TuitionPost)
    @JoinColumn({ name: 'tuition_post_id' })
    tuitionPost!: TuitionPost;

    @Column({
        type: 'enum',
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    })
    status!: 'pending' | 'accepted' | 'rejected';

    @Column('text')
    coverLetter!: string;

    @Column('float', { nullable: true })
    expectedPay?: number;

    @Column('simple-array')
    availableTimeSlots!: string[];

    @Column('int', { nullable: true })
    yearsOfExperience?: number;

    @Column('simple-array', { nullable: true })
    qualifications?: string[];

    @Column({
        type: 'enum',
        enum: ['online', 'offline', 'hybrid'],
        nullable: true
    })
    preferredMode?: 'online' | 'offline' | 'hybrid';

    @Column('text', { nullable: true })
    additionalNotes?: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at?: Date;
}