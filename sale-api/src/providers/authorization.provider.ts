import {Provider} from '@loopback/core';
import {
  Authorizer,
  AuthorizationContext,
  AuthorizationMetadata,
  AuthorizationDecision,
} from '@loopback/authorization';
import {Users} from '../models';
import {securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';

export class AuthorizationProvider implements Provider<Authorizer> {
  constructor() {}

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationContext: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    const clientRole = authorizationContext.principals[0].role.toString();

    const allowedRoles = metadata.allowedRoles || 'CUSTOMNER';
    // console.log(clientRole);

    if (allowedRoles.includes(clientRole)) {
      return AuthorizationDecision.ALLOW;
    }
    return AuthorizationDecision.DENY;
  }
}
