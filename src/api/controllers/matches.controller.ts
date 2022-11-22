import { NextFunction, Request, Response } from 'express';

import { MatchService } from '../../services';
import { ICustomRequest } from '../../types';

interface UpdateMatchBody {
  match_id: string,
  local_team_result: number,
  visiting_team_result: number,
}

export const getMatches = async (
  _: Request, res: Response,
  next: NextFunction
) => {
  try {
    let matches = await MatchService.findAll()?.lean();
    return res.status(200).json(matches)
  } catch (err) { return next(err); }
}

export const setMatchResult = async (
  req: ICustomRequest,
  res: Response, next: NextFunction
) => {
  try {
    const {
      match_id, local_team_result,
      visiting_team_result
    } = <UpdateMatchBody>req.body

    await MatchService.updateResult(
      match_id, local_team_result,
      visiting_team_result
    );
    return res.status(200)
      .json({ message: 'Match updated' })
  } catch (err) {
    return next(err);
  }
}