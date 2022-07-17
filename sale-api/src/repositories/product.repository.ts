import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SaledbDataSource} from '../datasources';
import {Product, ProductRelations} from '../models';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  constructor(
    @inject('datasources.saledb') dataSource: SaledbDataSource,
  ) {
    super(Product, dataSource);
  }
}
