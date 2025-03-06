import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import AppDataSource from "../bootstrap/data-source";
import { User } from "@entity";
import { QueryRunner } from "typeorm";

export const configurePassport = () => {
    // Serialize user to session
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: number, done) => {
        let queryRunner: QueryRunner | null = null;
        
        try {
            queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            
            // check if user exist
            const user = await queryRunner.manager.findOne(User, { 
                where: { id } 
            });
            
            done(null, user);
        } catch (error) {
            done(error, null);
        } finally {
            if (queryRunner) {
                await queryRunner.release();
            }
        }
    });

    // Configure Google Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/auth/google/callback",
                scope: ["profile", "email"],
            },
            async (accessToken, refreshToken, profile, done) => {
                let queryRunner: QueryRunner | null = null;
                
                try {
                    queryRunner = AppDataSource.createQueryRunner();
                    await queryRunner.connect();
                    
                    // Start a transaction
                    await queryRunner.startTransaction();
                    
                    // Check if user already exists
                    let user = await queryRunner.manager.findOne(User, { 
                        where: { googleId: profile.id } 
                    });

                    // Save User
                    if (!user) {
                        user = queryRunner.manager.create(User, {
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            profilePicture: profile.photos[0].value,
                        });
                        
                        await queryRunner.manager.save(user);
                        
                        // Commit the transaction
                        await queryRunner.commitTransaction();
                    }

                    return done(null, user);
                } catch (error) {
                    if (queryRunner && queryRunner.isTransactionActive) {
                        await queryRunner.rollbackTransaction();
                    }
                    
                    return done(error, null);
                } finally {
                    if (queryRunner) {
                        await queryRunner.release();
                    }
                }
            }
        )
    );
};