import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SaledbDataSource} from '../datasources';
import {Users, UsersRelations} from '../models';

export class UsersRepository extends DefaultCrudRepository<
  Users,
  typeof Users.prototype.id,
  UsersRelations
> {
  constructor(
    @inject('datasources.saledb') dataSource: SaledbDataSource,
  ) {
    super(Users, dataSource);
  }
}
