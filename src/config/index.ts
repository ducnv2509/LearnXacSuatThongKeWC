export default {
  api: {
    prefix: '/api/v1',
  },
  dbNameApp: process.env.DB_NAME_APP || 'suequipo',
  dbUriApp: process.env.MONGO_URI_APP || 'mongodb://root:123123@20.212.55.21:27017/?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-256',
  logFile: process.env.LOG_FILE || `${ __dirname }/../../logs/debug.log`,
  port: process.env.PORT || '4500',
  saltRounds: process.env.SALT_ROUNDS || '10',
  secretKey: process.env.SECRET_KEY || 'SECRET_KEY'
}