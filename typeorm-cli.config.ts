import { Coffee } from 'src/coffees/entities/coffee.entity';
import { Flavor } from 'src/coffees/entities/flavor.entity';
import { CoffeeRefactor1706372734036 } from 'src/migration/1706372734036-CoffeeRefactor';
import { SchemaSync1706373432615 } from 'src/migration/1706373432615-SchemaSync';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: [Coffee, Flavor, Event],
  migrations: [CoffeeRefactor1706372734036, SchemaSync1706373432615],
});
