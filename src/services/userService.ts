import User, { IUser, UserData } from 'models/userModel.js';

import { buildUserImagePaths, cleanupAsync } from 'utils/fileManager.js';

export const updateUserWithCleanup = async (
  userId: string,
  updateData: Partial<UserData>,
): Promise<IUser | null> => {
  // Only get old user data if we're updating the photo
  let oldUser: { photo?: string } | null = null;
  if (updateData.photo) {
    oldUser = await User.findById(userId).select('photo').lean();
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  // Async cleanup of old photo
  if (oldUser && oldUser.photo !== updateData.photo) {
    const imagesToDelete = buildUserImagePaths(oldUser);
    cleanupAsync(imagesToDelete);
  }

  return updatedUser;
};

export const deleteUser = async (
  userId: string,
): Promise<{ photo?: string } | null> => {
  // Get user data for file cleanup before deletion
  const user = await User.findById(userId).select('photo').lean();

  await User.findByIdAndDelete(userId);

  // Cleanup files after successful deletion
  if (user) {
    const imagesToDelete = buildUserImagePaths(user);
    cleanupAsync(imagesToDelete);
  }

  return user;
};

export const deactivateUser = async (userId: string): Promise<IUser | null> => {
  return User.findByIdAndUpdate(userId, { active: false });
};
