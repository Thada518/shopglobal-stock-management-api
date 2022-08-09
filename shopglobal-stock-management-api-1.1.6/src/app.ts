import compression from 'compression';
import cookieParser from 'cookie-parser';
import { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } from '@config';
import { createClient, RedisClientType } from 'redis';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import OracleDB from 'oracledb';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { init } from '@connections/oracle.connection';
import ProductConjob from '@crons/product.cron';
import SSVCron from '@crons/ssv.cron';
import CreateProductCron from '@crons/createProduct.cron';
import CreatePromotionCron from '@crons/createPromotion.cron';
import { jobTime } from '@config';
import cron from 'node-cron';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public redis: RedisClientType;
  public oracle: OracleDB.Connection;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    // middlewares
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
    this.startCronJob();
  }

  public getServer() {
    return this.app;
  }

  public getOracleClient() {
    return this.oracle;
  }

  public getRedisClient() {
    return this.redis;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'Shop Global Stock Management API',
          version: '1.0.0',
          description: 'API docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private async startCronJob() {
    logger.info(`======================================`);
    logger.info(`=== CronJob : Start At ${this.env} ===`);
    logger.info(`======================================`);
    const redisClient = createClient();
    await redisClient.connect();
    // const oracleClient = await init();

    console.log('[Info] Redis Connection from product conjobs');
    const product = new ProductConjob();
    product.run(redisClient as RedisClientType);
    console.log(`[Info] Update Stock job started`);
    // const ssv = new SSVCron();
    // ssv.run();
    // const CreateProduct = new CreateProductCron();
    // CreateProduct.run(redisClient as RedisClientType, oracleClient);
    // console.log(`[Info] Create Product job started`);
    // const CreatePromotion = new CreatePromotionCron();
    // CreatePromotion.run(redisClient as RedisClientType, oracleClient);
    // console.log(`[Info] Create Promotion job started`);
  }
}

export default App;
