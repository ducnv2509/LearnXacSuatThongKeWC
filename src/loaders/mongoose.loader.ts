import { Connection, createConnection } from 'mongoose';
// import { AddingService, UserService } from '../services';

import { logger } from '../utils';

export const mongooseLoader = (dbUri: string, dbName: string) => {
  createConnection(dbUri, {
    dbName: dbName,
    maxPoolSize: 10,
    autoCreate: true
  }).asPromise()
    .then((conn: Connection) => {
      // addPoint().catch((err) => {
      //   console.log(err);
      // })
      
      conn.on('error', (err) => {
        logger.error(`Database ${ dbName } has an error`, err.message);
      })
    
      conn.on('connected', () => {
        logger.info(`Database ${ dbName } connected`);
      })
    
      conn.on('disconnected', () => {
        logger.warn(`Database ${ dbName } disconnected`);
      })
    })
    .catch((err: Error) => {
      logger.error(`Database ${dbName} connection error`, err.message);
      mongooseLoader(dbUri, dbName);
    })
}


// async function addPoint() {
//   console.log("abc");
  
//   const users = await UserService.findAll()
//   if (!users) return;
//   for (const user of users) {
//     const oldScore = user.score;
//     const oldOrigin = user.origin_score;
//     const amount = 1000000;
//     user.score += amount;
//     user.origin_score += amount;
//     await AddingService.create(
//       new Date(), user._id,
//       amount, oldOrigin, oldScore
//     )
//     user.save()
//   }
// }