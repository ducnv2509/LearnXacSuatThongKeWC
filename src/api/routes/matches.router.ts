import { json, Router } from 'express';

import { getMatches, setMatchResult } from '../controllers';
import { verifyJWT } from '../middlewares';

export const router: Router = Router();

router.get('/', verifyJWT, getMatches)
router.post('/update', json(), verifyJWT, setMatchResult)