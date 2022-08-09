import OracleDB from 'oracledb';
import fs from 'fs';
import { ORACLE_HOST, ORACLE_USERNAME, ORACLE_PASSWORD, ORACLE_SERVICENAME } from '@config';

let libPath = '/opt/oracle/instantclient_21_6';
if (process.platform === 'win32') {
  // Windows
  libPath = 'C:\\oracle\\instantclient_19_12';
} else if (process.platform === 'darwin') {
  // macOS
  libPath = process.env.HOME + '/Downloads/instantclient_19_8';
}
if (libPath && fs.existsSync(libPath)) {
  OracleDB.initOracleClient({ libDir: libPath });
}
let client = null;
export async function init() {
  try {
    // Create a connection pool which will later be accessed via the
    // pool cache as the 'default' pool.
    // await OracleDB.createPool({
    //   user: ORACLE_USERNAME,
    //   password: ORACLE_PASSWORD,
    //   connectionString: `${ORACLE_HOST}/${ORACLE_SERVICENAME}`,
    //   // edition: 'ORA$BASE', // used for Edition Based Redefintion
    //   // events: false, // whether to handle Oracle Database FAN and RLB events or support CQN
    //   // externalAuth: false, // whether connections should be established using External Authentication
    //   // homogeneous: true, // all connections in the pool have the same credentials
    //   poolAlias: 'default', // set an alias to allow access to the pool via a name.
    //   // poolIncrement: 1, // only grow the pool by one connection at a time
    //   poolMax: 4, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
    //   // poolMin: 0, // start with no connections; let the pool shrink completely
    //   // poolPingInterval: 60, // check aliveness of connection if idle in the pool for 60 seconds
    //   poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
    //   // queueMax: 500, // don't allow more than 500 unsatisfied getConnection() calls in the pool queue
    //   // queueTimeout: 60000, // terminate getConnection() calls queued for longer than 60000 milliseconds
    //   // sessionCallback: myFunction, // function invoked for brand new connections or by a connection tag mismatch
    //   // sodaMetaDataCache: false, // Set true to improve SODA collection access performance
    //   // stmtCacheSize: 30, // number of statements that are cached in the statement cache of each connection
    //   // enableStatistics: false // record pool usage for oracledb.getPool().getStatistics() and logStatistics()
    // });
    // console.log('Connection pool started');

    if (client === null) {
      const connection = await OracleDB.getConnection({
        user: ORACLE_USERNAME,
        password: ORACLE_PASSWORD,
        connectionString: `${ORACLE_HOST}/${ORACLE_SERVICENAME}`,
      });
      console.log('[Connection] Oracle started');
      client = connection;
      return connection;
    } else {
      return client;
    }
  } catch (err) {
    console.error('init() error: ' + err.message);
  }
}

async function closePoolAndExit() {
  console.log('\nTerminating');
  try {
    // Get the pool from the pool cache and close it when no
    // connections are in use, or force it closed after 10 seconds.
    // If this hangs, you may need DISABLE_OOB=ON in a sqlnet.ora file.
    // This setting should not be needed if both Oracle Client and Oracle
    // Database are 19c (or later).
    await OracleDB.getPool().close(10);
    console.log('Pool closed');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

// process.once('SIGTERM', closePoolAndExit).once('SIGINT', closePoolAndExit);
