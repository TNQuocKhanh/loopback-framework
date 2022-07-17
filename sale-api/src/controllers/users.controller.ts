import {authenticate} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {Getter, inject} from '@loopback/core';
import {
  Filter,
  model,
  property,
  repository,
  FilterExcludingWhere,
  CountSchema,
  Count,
  Where,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  del,
  post,
  requestBody,
  SchemaObject,
  HttpErrors,
  response,
  patch,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {
  CustomerServiceBindings,
  AuthenticationStrategyConstants,
} from '../keys';
import {Users, SignInCredential, RoleEnum} from '../models';
import {UsersRepository} from '../repositories';
import {CustomerService, JWTService} from '../services';
import {encrypt, verifyPassword} from '../utilities/encrypt';
import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  authorize,
} from '@loopback/authorization';

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    protected jwtService: JWTService,
    @inject(CustomerServiceBindings.CUSTOMER_SERVICE)
    protected userService: CustomerService,
    @inject.getter(SecurityBindings.USER)
    private getCurrentUser: Getter<UserProfile>,
    @repository(UsersRepository) protected userRepository: UsersRepository,
  ) {}

  @post('/signup')
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'NewUser',
          }),
        },
      },
    })
    users: Omit<Users, 'id'>,
  ): Promise<Users> {
    const {username, password, email, role} = users;
    const newUser = new Users({username, email, role});

    const existAccount = await this.userRepository.findOne({
      where: {email},
    });
    if (existAccount) {
      throw new HttpErrors.Conflict('This email has been available.');
    }

    this.userService.validateCredentials({email, password});

    newUser.password = await encrypt(password);

    const createUser = await this.userRepository.create(newUser);

    console.log('NEW USER', createUser);

    return createUser;
  }

  @post('/users/login')
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SignInCredential),
        },
      },
    })
    credentials: SignInCredential,
  ): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }

  @authenticate(AuthenticationStrategyConstants.JWT)
  @authorize({allowedRoles: ['1']})
  @get('/users', {
    responses: {
      '200': {
        description: 'List of users',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Users, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Users) filter?: Filter<Users>): Promise<Users[]> {
    return this.userRepository.find(filter);
  }

  @authorize({allowedRoles: ['1']})
  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const isExistedAccount = await this.userRepository.exists(id);
    if (!isExistedAccount) {
      throw new HttpErrors.NotFound('User not found.');
    }

    // remove account by id.
    await this.userRepository.deleteById(id);
  }

  @authorize({allowedRoles: ['1']})
  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Users, {exclude: 'where'})
    filter?: FilterExcludingWhere<Users>,
  ): Promise<Users> {
    return this.userRepository.findById(id, filter);
  }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Users) where?: Where<Users>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    user: Users,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }
}
