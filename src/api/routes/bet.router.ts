import { Router, json } from 'express';
import { betScore, betWinner, getBetOfMatch, getBetOfUser, getBetReport } from '../controllers/bet.controller';
import { verifyJWT } from '../middlewares';


export const router: Router = Router();
router.post('/winner', json(), verifyJWT, betWinner)
router.post('/score', json(), verifyJWT, betScore)
router.get('/user', json(), verifyJWT, getBetOfUser)
router.get('/match/:id', json(), verifyJWT, getBetOfMatch)
router.get('/get-report', json(), getBetReport)