interface IScore {
  result: number,
  _id: string,
  name: string,
  image: string
}

export interface IMatch {
  _id: string,
  group: string,
  date: Date,
  has_played: boolean,
  local_team: IScore,
  visiting_team: IScore
}