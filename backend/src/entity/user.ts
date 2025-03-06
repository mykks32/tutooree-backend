import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import IUser from 'src/interfaces/IUser';

@Entity('users')
export default class User extends BaseEntity implements IUser {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    profilePicture: string;

    @Column()
    googleId: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
