import { DataSource } from 'typeorm';
import config from './config';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [],
});

export default AppDataSource;