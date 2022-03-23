import { Injectable } from '@angular/core';
import {
  UserCreateRequest,
  UserCreateResponse,
  UserDeleteRequest,
  UserDeleteResponse,
  UserInfoRequest,
  UserInfoResponse,
  UserListRequest,
  UserListResponse,
  UserUpdateRequest,
  UserUpdateResponse
} from 'picsur-shared/dist/dto/api/usermanage.dto';
import { EUser } from 'picsur-shared/dist/entities/user.entity';
import { AsyncFailable, HasFailed } from 'picsur-shared/dist/types';
import { FullUserModel } from 'src/app/models/forms/fulluser.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserManageService {
  constructor(private apiService: ApiService) {}

  public async getUser(username: string): AsyncFailable<EUser> {
    const body = {
      username,
    };

    const result = await this.apiService.post(
      UserInfoRequest,
      UserInfoResponse,
      'api/user/info',
      body
    );

    return result;
  }

  public async getUsers(count: number, page: number): AsyncFailable<EUser[]> {
    const body = {
      count,
      page,
    };

    const result = await this.apiService.post(
      UserListRequest,
      UserListResponse,
      '/api/user/list',
      body
    );

    if (HasFailed(result)) {
      return result;
    }

    return result.users;
  }

  public async createUser(user: FullUserModel): AsyncFailable<EUser> {
    const result = await this.apiService.post(
      UserCreateRequest,
      UserCreateResponse,
      '/api/user/create',
      user
    );

    return result;
  }

  public async updateUser(user: FullUserModel): AsyncFailable<EUser> {
    const result = await this.apiService.post(
      UserUpdateRequest,
      UserUpdateResponse,
      '/api/user/update',
      user
    );

    return result;
  }

  public async deleteUser(username: string): AsyncFailable<EUser> {
    const body = {
      username,
    };

    const result = await this.apiService.post(
      UserDeleteRequest,
      UserDeleteResponse,
      '/api/user/delete',
      body
    );

    return result;
  }
}