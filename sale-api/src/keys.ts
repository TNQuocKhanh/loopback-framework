import {BindingKey} from '@loopback/core';
import {UserService} from '@loopback/authentication';
import {Users, SignInCredential} from './models';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = 'secret-key';
  export const TOKEN_EXPIRES_IN_VALUE = '21600';
}

export namespace CustomerServiceBindings {
  export const CUSTOMER_SERVICE = BindingKey.create<
    UserService<Users, SignInCredential>
  >('services.users.service');
}

export namespace DataSourceBindings {
  export const DATA_SOURCE = 'saledb.db';
}

export namespace AuthorizationBindings {
  export const DEFAULT_DECISION = 'authorization.default-decision';
  export const AUTHORIZER_PROVIDER = 'providers.authorizer.provider';
}

export namespace AuthenticationStrategyConstants {
  export const JWT = 'jwt';
}
