import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import User from './user';
import { ITuitionPost } from '@interfaces';

@Entity('tuition_posts')
export default class TuitionPost extends BaseEntity implements ITuitionPost {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('text')
    description!: string;

    @Column('simple-array')
    preferredTimeSlots!: string[];

    @Column('float')
    pay!: number;

    @Column({
        type: 'enum',
        enum: ['fixed', 'negotiable']
    })
    payType!: 'fixed' | 'negotiable';

    @Column({
        type: 'enum',
        enum: ['online', 'offline', 'hybrid']
    })
    mode!: 'online' | 'offline' | 'hybrid';

    @Column()
    residingLocation!: string;

    @Column()
    grade!: string;

    @Column('simple-array')
    subject!: string[];

    @Column()
    tuitionLocation!: string;

    @Column()
    areaRange!: string;

    @Column('timestamp')
    expiryDate!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'posted_by' })
    posted_by!: User;

    @Column('simple-array', { nullable: true })
    tutorRequirements?: string[];

    @Column({
        type: 'enum',
        enum: ['weekly', 'bi-weekly', 'monthly', 'flexible']
    })
    sessionFrequency!: 'weekly' | 'bi-weekly' | 'monthly' | 'flexible';

    @Column({
        type: 'enum',
        enum: ['male', 'female', 'any'],
        nullable: true
    })
    tutorGenderPreference?: 'male' | 'female' | 'any';

    @Column('boolean', { default: true })
    isActive!: boolean;

    @Column('int')
    numberOfStudents!: number;

    @Column({ nullable: true })
    additionalNotes?: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at?: Date;
}