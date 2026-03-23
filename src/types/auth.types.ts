import { Request } from 'express';
import { IUser } from '@/models/User.model';

export interface IAuthRequest extends Request {
  user?: IUser;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
  accessToken: string;
  refreshToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}
