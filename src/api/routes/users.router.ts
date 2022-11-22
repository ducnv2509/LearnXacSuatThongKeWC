import { json, Router } from 'express';

import { getUsersRanking, register, updateUser } from '../controllers';
import { calculatePoint } from '../controllers/users.controller';
import { validatorHandler, verifyJWT } from '../middlewares';

export const router: Router = Router();

router.post('/calculate-point', verifyJWT, calculatePoint)

router.get(
  '/',
  verifyJWT,
  getUsersRanking
)

router.post(
  '/',
  json(),
  validatorHandler('register', 'body'),
  register
)

router.patch(
  '/:id',
  json(),
  verifyJWT,
  validatorHandler('userUpdateParams', 'params'),
  validatorHandler('userUpdateBody', 'body'),
  updateUser
)