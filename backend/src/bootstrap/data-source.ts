import { DataSource } from "typeorm";
import config from "./config";
import Entities from "@entity";

const AppDataSource = new DataSource({
  type: "postgres",
  url: config.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [...Object.values(Entities)],
});

export default AppDataSource;
