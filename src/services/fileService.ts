import sharp from 'sharp';
import * as fs from 'fs/promises';
import path from 'path';

import __dirname from 'constants/dirname.js';

const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    await fs.access(fullPath); // Check if file exists
    await fs.unlink(fullPath);
    console.log(`Successfully deleted: ${filePath}`);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
      console.log(`Error deleting file ${filePath}:`, error.message);
    }
    // Don't throw error - continue operation even if file deletion fails
  }
};

export interface ProcessImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Process and save images with optimized Sharp pipeline
 */
export const processImage = async (
  buffer: Buffer,
  outputPath: string,
  options: ProcessImageOptions = {},
): Promise<sharp.OutputInfo> => {
  const { width = 2000, height = 1333, quality = 90 } = options;

  return sharp(buffer)
    .resize(width, height)
    .toFormat('jpeg')
    .jpeg({ quality })
    .toFile(outputPath);
};

export interface ImageJob {
  buffer: Buffer;
  outputPath: string;
  options?: ProcessImageOptions;
}

/**
 * Process multiple images concurrently
 */
export async function processImages(
  imageJobs: ImageJob[],
): Promise<sharp.OutputInfo[]> {
  const promises = imageJobs.map(job =>
    processImage(job.buffer, job.outputPath, job.options),
  );

  return Promise.all(promises);
}

/**
 * Asynchronously cleanup old files (non-blocking)
 */
export const cleanupAsync = async (imagesToDelete: string[]): Promise<void> => {
  if (!imagesToDelete || imagesToDelete.length === 0) return;

  // Use setImmediate to ensure this happens after response is sent
  setImmediate(async () => {
    try {
      const deletePromises = imagesToDelete.map(imagePath =>
        deleteFile(imagePath),
      );

      await Promise.allSettled(deletePromises);
    } catch (error) {
      console.log(
        'File cleanup error: 💥',
        error instanceof Error ? error.message : String(error),
      );
      // Don't throw - cleanup failures shouldn't affect the main operation
    }
  });
};

export interface TourWithImages {
  imageCover?: string;
  images?: string[];
}

export const buildTourImagePaths = (oldTour: TourWithImages): string[] => {
  const pathsToDelete: string[] = [];

  if (oldTour.imageCover) {
    pathsToDelete.push(`public/img/tours/${oldTour.imageCover}`);
  }

  if (oldTour.images && oldTour.images.length > 0) {
    oldTour.images.forEach((image: string) => {
      pathsToDelete.push(`public/img/tours/${image}`);
    });
  }

  return pathsToDelete;
};

export interface UserWithPhoto {
  photo?: string;
}

export const buildUserImagePaths = (oldUser: UserWithPhoto): string[] => {
  const pathsToDelete: string[] = [];

  if (oldUser?.photo && oldUser.photo !== 'default.jpg') {
    pathsToDelete.push(`public/img/users/${oldUser.photo}`);
  }

  return pathsToDelete;
};
