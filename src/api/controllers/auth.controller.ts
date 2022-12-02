import { NextFunction, Request, Response } from 'express';
import { compareSync } from 'bcryptjs';

import { IPayload } from '../../types';
import { AddingService, UserService } from '../../services';
import { ErrorHandler, generateJWT } from '../../utils';

interface login {
  document: string,
  password: string
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  let { document, password } = <login>req.body;
  try {
    let userModel = await UserService.findById(document)
    let user = userModel?.toJSON();

    if (!user) {
      throw new ErrorHandler(400, 40001, 'Invalid user or password');
    }

    if (!compareSync(password, user.password)) {
      throw new ErrorHandler(400, 40001, 'Invalid user or password');
    }

    let payload: IPayload = {
      document: user._id,
    }

    let addedScore = Number(userModel?.score);
    let isAdded = false;
    const token = await generateJWT(payload);
    const now = new Date();
    const lastLogin = userModel?.last_logined
    if (!lastLogin || !sameDay(now, lastLogin)) {
      isAdded = true;
      const addedOrginScore = Number(userModel?.origin_score) + 20000;
      addedScore = Number(userModel?.score) + 20000;
      await UserService.updatePoint(document, addedScore, addedOrginScore);
      await AddingService.create(
        now, document, 20000,
        Number(userModel?.origin_score),
        Number(userModel?.score)
      )
    }
    await UserService.updateTimeLogin(document, new Date())
    // logger.info(`Login user ${user._id}`, getExtraParams(req));
    return res
      .status(200)
      .json({
        token: token,
        document: user._id,
        names: user.names,
        score: addedScore,
        selected_teams: user.selected_teams,
        isAdded
      })
  } catch (err) {
    return next(err);
  }
}

function sameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}