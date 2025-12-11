import express from 'express';

import * as userController from 'controllers/userController.js';

const router = express.Router();

router.route('/').get(userController.getAllUsers);

router
  .route('/:userId')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
