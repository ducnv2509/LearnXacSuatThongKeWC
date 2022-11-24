import { NextFunction, Request, Response } from 'express';
import { UserMatchesService, UserService } from '../../services';
import { ICustomRequest } from '../../types';
import { ErrorHandler } from '../../utils';

interface register {
  document: string,
  names: string,
  surnames: string,
  password: string
}

interface updated {
  password?: string,
  champion?: string,
  runner_up?: string,
  third_place?: string,
}

export const calculatePoint = async (_: Request, res: Response, next: NextFunction) => {
  try {
    await UserMatchesService.calculatePoint();
    return res.status(200)
      .json({ message: 'point calculated' })
  } catch (err) { return next(err); }
}

export const getUsersRanking = async (_: Request, res: Response, next: NextFunction) => {
  try {
    let users = await UserService.findAll({ score: true, names: true })?.lean();
    return res.status(200).json(users)
  } catch (err) { return next(err); }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      document, names,
      surnames, password
    } = <register>req.body;

    const user = await UserService.exists(document);

    if (user) {
      throw new ErrorHandler(400, 40003, 'User exists');
    }

    let newUser = {
      _id: document,
      names: names,
      surnames: surnames,
      password: password,
      score: 1000000,
      selected_teams: {
        champion: null,
        runner_up: null,
        third_place: null
      }
    }

    await UserService.create(newUser)
    return res.status(201).json({
      message: 'User created',
      id: document
    })
  } catch (err) { return next(err); }
}


export const updateUser = async (req: ICustomRequest, res: Response, next: NextFunction) => {
  try {
    const { password, champion, runner_up, third_place } = <updated>req.body

    if (password) {
      await UserService.updateById(<string>req.payload?.document, password, 'password');
    } else if (champion) {
      await UserService.updateById(<string>req.payload?.document, champion, 'champion');
    } else if (runner_up) {
      await UserService.updateById(<string>req.payload?.document, runner_up, 'runner_up');
    } else if (third_place) {
      await UserService.updateById(<string>req.payload?.document, third_place, 'third_place');
    } else {
      throw new ErrorHandler(500, 50002, 'Invalid user updated');
    }
    return res
      .status(200)
      .json({
        message: 'User updated'
      })
  } catch (err) {
    return next(err);
  }
}