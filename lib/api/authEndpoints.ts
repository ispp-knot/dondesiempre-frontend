import { authorizedOfetch } from '@/lib/api/authorizedOfetch';
import { getBackendUrl } from '../config';

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

export async function login(dto: LoginDTO): Promise<void> {
  const url = `${getBackendUrl()}/api/v1/auth/login`;
  await authorizedOfetch(url, {
    method: 'POST',
    body: dto,
    credentials: 'include',
  });
}
