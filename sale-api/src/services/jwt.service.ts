import {TokenService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import jwt from 'jsonwebtoken';

export class JWTService implements TokenService {
  @inject(TokenServiceBindings.TOKEN_SECRET) protected jwtSecretKey: string;
  @inject(TokenServiceBindings.TOKEN_EXPIRES_IN) protected jwtExpiresIn: string;

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized('Error verifying token: token is null');
    }

    try {
      const decodedToken: any = jwt.verify(token, this.jwtSecretKey);

      const userProfile = {
        [securityId]: decodedToken['id'].toString(),
        id: decodedToken['id'],
        email: decodedToken['email'],
        role: decodedToken['role'],
      };

      return userProfile;
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error verifying token: ${error}`);
    }
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token : userProfile is null',
      );
    }

    const userDataForToken = {
      id: userProfile.id, // userId: number
      email: userProfile.email,
      role: userProfile.role,
    };

    try {
      const token = jwt.sign(userDataForToken, this.jwtSecretKey, {
        expiresIn: Number(this.jwtExpiresIn),
      });

      return token;
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error decoding token: ${error}`);
    }
  }
}
