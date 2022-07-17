import {model, property} from '@loopback/repository';

@model()
export class SignInCredential {
  @property({
    type: 'string',
    required: true,
  })
  email: string;
  @property({
    type: 'string',
    required: true,
  })
  password: string;

  constructor(data: SignInCredential) {
    this.email = data.email;
    this.password = data.password;
  }
}
