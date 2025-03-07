import { Request, Response } from "express";
import { QueryRunner } from "typeorm";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import AppDataSource from "@bootstrap/data-source";
import { TuitionPost } from "@entity";
import {
  createTuitionPostSchema,
  updateTuitionPostSchema,
  getTuitionPostsQuerySchema,
  CreateTuitionPostInput,
  UpdateTuitionPostInput,
  GetTuitionPostsQuery,
  idSchema,
} from "@schemas";
import { IUser } from "@interfaces";

const {
  BAD_REQUEST,
  CREATED,
  OK,
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  UNPROCESSABLE_ENTITY,
} = StatusCodes;

// Create a new tuition post
export const createTuitionPost = async (req: Request, res: Response) => {
  const queryRunner: QueryRunner = AppDataSource.createQueryRunner();

  try {
    // Start transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const validatedData = createTuitionPostSchema.parse(
      req.body
    ) as CreateTuitionPostInput;

    // Get current user ID from the request
    const userId = (req.user as IUser)?.id;
    if (!userId) {
      return res.status(UNAUTHORIZED).json({
        error: "User must be authenticated to create a tuition post",
      });
    }

    const tuitionPost = new TuitionPost();
    Object.assign(tuitionPost, {
      ...validatedData,
      posted_by: userId,
      isActive: true,
    });

    await queryRunner.manager.save(tuitionPost);
    await queryRunner.commitTransaction();

    return res.status(CREATED).json({
      message: "Tuition post created successfully",
      data: tuitionPost,
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

// Get all tuition posts with filtering and pagination
export const getAllTuitionPosts = async (req: Request, res: Response) => {
  try {
    const queryParams = getTuitionPostsQuerySchema.parse(
      req.query
    ) as GetTuitionPostsQuery;
    const {
      search,
      page,
      page_size,
      sort_by,
      sort_order,
      mode,
      pay_min,
      pay_max,
      subject,
      grade,
      is_active,
    } = queryParams;

    // Use the repository pattern instead of createQueryBuilder on the entity
    const tuitionPostRepository = AppDataSource.getRepository(TuitionPost);
    const query = tuitionPostRepository
      .createQueryBuilder("tuitionPost")
      .leftJoinAndSelect("tuitionPost.posted_by", "user");

    // Apply filtering conditions
    if (search && search !== "") {
      query.where(
        "tuitionPost.description ILIKE :search OR tuitionPost.grade ILIKE :search OR tuitionPost.residingLocation ILIKE :search OR tuitionPost.tuitionLocation ILIKE :search",
        {
          search: `%${search}%`,
        }
      );
    }

    if (mode) {
      query.andWhere("tuitionPost.mode = :mode", { mode });
    }

    if (pay_min) {
      query.andWhere("tuitionPost.pay >= :pay_min", { pay_min });
    }

    if (pay_max) {
      query.andWhere("tuitionPost.pay <= :pay_max", { pay_max });
    }

    if (subject) {
      // For simple-array columns, we need to use LIKE
      query.andWhere("tuitionPost.subject LIKE :subject", {
        subject: `%${subject}%`,
      });
    }

    if (grade) {
      query.andWhere("tuitionPost.grade = :grade", { grade });
    }

    if (is_active !== undefined) {
      query.andWhere("tuitionPost.isActive = :is_active", { is_active });
    }

    // Apply sorting
    if (sort_by && sort_order) {
      query.orderBy(`tuitionPost.${sort_by}`, sort_order as "ASC" | "DESC");
    }

    // Get total count before pagination
    const total = await query.getCount();

    // Apply pagination
    const skip = (page - 1) * page_size;
    query.skip(skip).take(page_size);

    const tuitionPosts = await query.getMany();

    return res.status(OK).json({
      message: "Tuition posts retrieved successfully",
      data: tuitionPosts,
      meta: {
        total,
        page,
        page_size,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(BAD_REQUEST).json({
        error: "Validation failed",
        details: error.errors,
      });
    }

    return res.status(INTERNAL_SERVER_ERROR).json({
      error: `An unexpected error occurred: ${error.message}`,
    });
  }
};

// Get a single tuition post by ID
export const getTuitionPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Use repository pattern
    const tuitionPostRepository = AppDataSource.getRepository(TuitionPost);
    const tuitionPost = await tuitionPostRepository
      .createQueryBuilder("tuitionPost")
      .leftJoinAndSelect("tuitionPost.posted_by", "user")
      .where("tuitionPost.id = :id", { id })
      .getOne();

    if (!tuitionPost) {
      return res.status(NOT_FOUND).json({
        error: "Tuition post not found",
      });
    }

    return res.status(OK).json({
      message: "Tuition post retrieved successfully",
      data: tuitionPost,
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      error: `An unexpected error occurred: ${error.message}`,
    });
  }
};

// Update a tuition post
export const updateTuitionPost = async (req: Request, res: Response) => {
  const queryRunner: QueryRunner = AppDataSource.createQueryRunner();

  try {
    // Start transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { id } = idSchema.parse(req.params);

    // Get current user ID from the request
    const userId = (req.user as IUser)?.id;
    if (!userId) {
      return res.status(UNAUTHORIZED).json({
        error: "User must be authenticated to update a tuition post",
      });
    }

    const tuitionPost = await queryRunner.manager.findOne(TuitionPost, {
      where: { id },
      relations: ["posted_by"],
    });

    if (tuitionPost.posted_by.id !== userId) {
      return res.status(UNAUTHORIZED).json({
        error: "You are not authorized to update this tuition post",
      });
    }

    // Check if the user is the owner of the post
    if (tuitionPost.posted_by.id !== userId) {
      return res.status(UNAUTHORIZED).json({
        error: "You are not authorized to update this tuition post",
      });
    }

    const validatedData = updateTuitionPostSchema.parse(
      req.body
    ) as UpdateTuitionPostInput;

    // Update tuition post
    Object.assign(tuitionPost, validatedData);

    await queryRunner.manager.save(tuitionPost);
    await queryRunner.commitTransaction();

    return res.status(OK).json({
      message: "Tuition post updated successfully",
      data: tuitionPost,
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

// Delete a tuition post
export const deleteTuitionPost = async (req: Request, res: Response) => {
  const queryRunner: QueryRunner = AppDataSource.createQueryRunner();

  try {
    // Start transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { id } = idSchema.parse(req.params);

    // Get current user ID from the request
    const userId = (req.user as IUser)?.id;
    if (!userId) {
      return res.status(UNAUTHORIZED).json({
        error: "User must be authenticated to delete a tuition post",
      });
    }

    const tuitionPost = await queryRunner.manager.findOne(TuitionPost, {
      where: { id },
      relations: ["posted_by"],
    });

    if (!tuitionPost) {
      return res.status(NOT_FOUND).json({
        error: "Tuition post not found",
      });
    }

    // Check if the user is the owner of the post
    if (tuitionPost.posted_by.id !== userId) {
      return res.status(UNAUTHORIZED).json({
        error: "You are not authorized to delete this tuition post",
      });
    }

    await queryRunner.manager.remove(tuitionPost);
    await queryRunner.commitTransaction();

    return res.status(OK).json({
      message: "Tuition post deleted successfully",
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();

    return res.status(INTERNAL_SERVER_ERROR).json({
      error: `An unexpected error occurred: ${error.message}`,
    });
  } finally {
    await queryRunner.release();
  }
};
