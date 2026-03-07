import { authorizedOfetch } from '@/lib/api/authorizedOfetch';
import { getBackendUrl } from '../config';
import { UserInfo } from '../types/auth';

export interface RegisterClientDTO {
  email: string;
  password: string;
  name: string;
  surname: string;
  phone: string;
  address: string;
}

export interface RegisterStoreDTO {
  email: string;
  password: string;
  name: string;
  storeID: string;
  latitude: number;
  longitude: number;
  address: string;
  openingHours: string;
  acceptsShipping: boolean;
  phone: string;
  aboutUs: string;
  primaryColor: string;
  secondaryColor: string;
}

export async function registerClient(dto: RegisterClientDTO): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/auth/register/client`;
  await authorizedOfetch(url, {
    method: 'POST',
    body: dto,
  });
}

export async function registerStore(dto: RegisterStoreDTO): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/auth/register/store`;
  await authorizedOfetch(url, {
    method: 'POST',
    body: dto,
  });
}

export interface LoginDTO {
  email: string;
  password: string;
}

export async function login(dto: LoginDTO): Promise<UserInfo> {
  const url = `${getBackendUrl()}/api/v1/auth/login`;
  return authorizedOfetch(url, {
    method: 'POST',
    body: dto,
  });
}

export async function getMe(): Promise<UserInfo> {
  const url = `${getBackendUrl()}/api/v1/auth/me`;
  return authorizedOfetch(url, {
    method: 'GET',
  });
}

export async function logOut(): Promise<UserInfo> {
  const url = `${getBackendUrl()}/api/v1/auth/logout`;
  return authorizedOfetch(url, {
    method: 'GET',
  });
}
