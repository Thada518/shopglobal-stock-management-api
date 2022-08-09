import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  SECRET_KEY,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  WC_URL,
  WC_KEY,
  WC_SECRET,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_USERNAME,
  REDIS_PASSWORD,
  ORACLE_HOST,
  ORACLE_USERNAME,
  ORACLE_PASSWORD,
  ORACLE_SERVICENAME,
} = process.env;

export const jobTime = {
  UPDATE_STOCK_MODE_PREPARE: '*/50 * * * *',
  UPDATE_STOCK_MODE_RESET: '0 */5 * * *',
  SSV_CRON_JOB: '0 0 * * TUE',
  ADD_PRODUCT: '* * * * *',
  WATCH_CHANGE: '*/10 * * * * *',
};

export const categories = {
  ['JEWELRY']: {
    id: 69,
  },
  ['DRINK']: {
    id: 965,
  },
  ['Fashion']: {
    id: 92,
  },
  ['CLENSING']: {
    id: 990,
  },
  ['FOOD']: {
    id: 74,
  },
  ['HEALTH']: {
    id: 964,
  },
  ['HH-HOME OTHERS']: {
    id: 72,
  },
  ['OTHERS']: {
    id: 113,
  },
  ['BAG']: {
    id: 100,
  },
  ['GLASS WEAR']: {
    id: 101,
  },
  ['WATCH']: {
    id: 102,
  },
  ['SHOES']: {
    id: 99,
  },
  ['HEALTHY FOOD']: {
    id: 964,
  },
  ['HEALTH BEAUTY']: {
    id: 964,
  },
  ['HEALTH OTHERS']: {
    id: 964,
  },
};

export const promotionEnum = {
  ['พิเศษวันนี้']: {
    id: 748,
  },
  ['พิเศษช่วงนี้']: {
    id: 1331,
  },
  ['ราคาเฉพาะวันนี้']: {
    id: 1332,
  },
  ['ราคาพิเศษ']: {
    id: 1330,
  },
  ['นาทีทอง']: {
    id: 1334,
  },
  ['ราคาดีวันนี้']: {
    id: 1333,
  },
};
