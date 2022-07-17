import {UserService} from '@loopback/authentication';
import {Users, SignInCredential} from '../models';
import {UserProfile, securityId} from '@loopback/security';
import {repository} from '@loopback/repository';
import {UsersRepository} from '../repositories';
import {HttpErrors} from '@loopback/rest';
import {verifyPassword} from '../utilities/encrypt';

export class CustomerService implements UserService<Users, SignInCredential> {
  constructor(
    @repository(UsersRepository) protected accountRepository: UsersRepository,
  ) {}

  public validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  public validateCredentials(credentials: SignInCredential) {
    const invalidCredentialsErrorMessage = 'Invalid email or password.';

    // validate username and password
    if (!this.validatePassword(credentials.password)) {
      throw new HttpErrors.BadRequest(invalidCredentialsErrorMessage);
    }
  }
  async verifyCredentials(credentials: SignInCredential): Promise<Users> {
    this.validateCredentials(credentials);

    // const incorrectCredentialsErrorMessage = 'Incorrect username or password.';
    const incorrectCredentialsErrorMessage = 'Account not found';
    const incorrectCredentialsErrorMessage2 = 'Password is not correct.';

    const foundAccount = await this.accountRepository.findOne({
      where: {email: credentials.email},
      //   include: ['role'],
    });

    if (foundAccount === null) {
      throw new HttpErrors.Unauthorized(incorrectCredentialsErrorMessage);
    }

    const isMatchPassword = await verifyPassword(
      credentials.password,
      foundAccount.password,
    );
    if (!isMatchPassword) {
      throw new HttpErrors.Unauthorized(incorrectCredentialsErrorMessage2);
    }

    return foundAccount;
  }

  convertToUserProfile(user: Users): UserProfile {
    // account always has `id` property.
    return {
      [securityId]: user.id!.toString(),
      id: user.id!,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }
}
