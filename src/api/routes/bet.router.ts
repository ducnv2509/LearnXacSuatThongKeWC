import { Router, json } from 'express';
import { verifyJWT } from '../middlewares';


export const router: Router = Router();

router.post(
  '/sorceBet',
  json(),
  verifyJWT,
)