import AppDataSource from '@bootstrap/data-source';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createTuitionApplicationSchema, CreateTuitionPostInput } from '@schemas';
import { QueryRunner } from 'typeorm';
import { ZodError } from 'zod';
import { ICreateTuitionApplicationInput, IUser } from '@interfaces';
import { TuitionPost, User } from '@entity';
import TuitionApplication from 'src/entity/application';
const {
  BAD_REQUEST,
  CREATED,
  OK,
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  UNPROCESSABLE_ENTITY,
} = StatusCodes;

export const createTuitionApplication = async (req: Request, res: Response) => {
  const queryRunner: QueryRunner = AppDataSource.createQueryRunner();

  try {
    // Start transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { tuitionPostId } = req.params;

    const validatedData = createTuitionApplicationSchema.parse(
      req.body
    ) as ICreateTuitionApplicationInput;

    // Get current user ID from the request
    const userId = (req.user as IUser)?.id;
    if (!userId) {
      return res.status(UNAUTHORIZED).json({
        error: "User must be authenticated to apply for a tuition post",
      });
    }

    const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
    if (!user) {
      return res.status(UNAUTHORIZED).json({
        error: "User not found",
      });
    }

    // Check if the tuition post exists
    const tuitionPost = await queryRunner.manager.findOne(TuitionPost, {
      where: { id: parseInt(tuitionPostId), isActive: true }
    });

    if (!tuitionPost) {
      return res.status(NOT_FOUND).json({
        error: "Tuition post not found or is no longer active",
      });
    }

    // Check if user has already applied for this post
    const existingApplication = await queryRunner.manager.findOne(TuitionApplication, {
      where: {
        applicant: { id: userId },
        tuitionPost: { id: parseInt(tuitionPostId) }
      }
    });

    if (existingApplication) {
      return res.status(BAD_REQUEST).json({
        error: "You have already applied for this tuition post",
      });
    }

    // Create new application
    const tuitionApplication = new TuitionApplication();
    Object.assign(tuitionApplication, {
      ...validatedData,
      applicant: user,
      tuitionPost,
      status: 'pending'
    });

    await queryRunner.manager.save(tuitionApplication);
    await queryRunner.commitTransaction();

    return res.status(CREATED).json({
      message: "Application submitted successfully",
      data: tuitionApplication,
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();

    if (error instanceof ZodError) {
      return res.status(BAD_REQUEST).json({
        error: "Validation failed",
        details: error.errors,
      });
    }

    return res.status(INTERNAL_SERVER_ERROR).json({
      error: `An unexpected error occurred: ${error.message}`,
    });
  } finally {
    await queryRunner.release();
  }
};

// Get applications for a tuition post (for post owners)
export const getTuitionApplications = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req.user as IUser)?.id;
    
    if (!userId) {
      return res.status(UNAUTHORIZED).json({
        error: "User must be authenticated to view applications",
      });
    }

    // Check if the user owns this post
    const tuitionPost = await TuitionPost.findOne({
      where: { id: parseInt(postId), posted_by: { id: userId } }
    });

    if (!tuitionPost) {
      return res.status(NOT_FOUND).json({
        error: "Tuition post not found or you don't have permission to view its applications",
      });
    }

    const applications = await TuitionApplication.find({
      where: { tuitionPost: { id: parseInt(postId) } },
      relations: ['applicant']
    });

    return res.json({ data: applications });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      error: `An unexpected error occurred: ${error.message}`,
    });
  }
};

// Get applications by current user
export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUser)?.id;
    
    if (!userId) {
      return res.status(UNAUTHORIZED).json({
        error: "User must be authenticated to view applications",
      });
    }

    const applications = await TuitionApplication.find({
      where: { applicant: { id: userId } },
      relations: ['tuitionPost', 'tuitionPost.posted_by']
    });

    return res.status(OK).json({ data: applications });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      error: `An unexpected error occurred: ${error.message}`,
    });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  const queryRunner: QueryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = (req.user as IUser)?.id;
    
    if (!userId) {
      return res.status(UNAUTHORIZED).json({
        error: "User must be authenticated to update application status",
      });
    }
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(BAD_REQUEST).json({
        error: "Status must be either 'accepted' or 'rejected'",
      });
    }
    
    // Get the application with tuition post relation
    const application = await queryRunner.manager.findOne(TuitionApplication, {
      where: { id: parseInt(applicationId) },
      relations: ['tuitionPost', 'tuitionPost.posted_by']
    });
    
    if (!application) {
      return res.status(NOT_FOUND).json({
        error: "Application not found",
      });
    }
    
    // Check if the user is the owner of the tuition post
    if (application.tuitionPost.posted_by.id !== userId) {
      return res.status(UNAUTHORIZED).json({
        error: "You don't have permission to update this application's status",
      });
    }
    
    // Update the status
    application.status = status as 'accepted' | 'rejected';
    await queryRunner.manager.save(application);
    
    await queryRunner.commitTransaction();
    
    return res.status(OK).json({
      message: `Application ${status} successfully`,
      data: application
    });
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    return res.status(INTERNAL_SERVER_ERROR).json({
      error: `An unexpected error occurred: ${error.message}`,
    });
  } finally {
    await queryRunner.release();
  }
};