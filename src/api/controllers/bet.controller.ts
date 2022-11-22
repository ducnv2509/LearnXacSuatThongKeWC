import { NextFunction, Response } from "express";
import { UserMatchesService } from "../../services";
import { ICustomRequest } from "../../types";

interface BetWinnerBody {
    match_id: string,
    value: string,
    betAmount: number

}

interface BetScoreBody {
    match_id: string,
    localBet: number,
    visitorBet: number,
    betAmount: number
}

export const betWinner = async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const user_id = <string>req.payload?.document;
        const betData = <BetWinnerBody>req.body;
        await UserMatchesService.betWinner(
            user_id, betData.match_id
            , betData.value, betData.betAmount
        )
        return res.status(200).json({ message: 'Bet updated' })
    } catch (err) {
        return next(err)
    }
}

export const betScore = async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const user_id = <string>req.payload?.document;
        const betData = <BetScoreBody>req.body;
        await UserMatchesService.betScore(
            user_id, betData.match_id, betData.localBet,
            betData.visitorBet, betData.betAmount
        )
        return res.status(200).json({ message: 'Bet updated' })
    } catch (err) {
        return next(err)
    }
}

export const getBetOfUser = async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const user_id = <string>req.payload?.document;
        const data = await UserMatchesService.findAllByUser(user_id)
        return res.status(200).json(data)
    } catch (err) {
        return next(err)
    }
}

export const getBetOfMatch = async (req: ICustomRequest, res: Response, next: NextFunction) => {
    try {
        const match_id = <string>req.params['id'];
        const data = await UserMatchesService.findAllByMatch(match_id)
        return res.status(200).json(data)
    } catch (err) {
        return next(err)
    }
}