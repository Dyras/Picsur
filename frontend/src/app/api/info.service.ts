import { Injectable } from '@angular/core';
import { InfoResponse } from 'picsur-shared/dist/dto/api/info.dto';
import { AsyncFailable, HasFailed } from 'picsur-shared/dist/types';
import { BehaviorSubject } from 'rxjs';
import { ServerInfo } from '../models/server-info';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  private readonly logger = console;

  public get live() {
    return this.infoSubject;
  }

  private infoSubject = new BehaviorSubject<ServerInfo>(new ServerInfo());

  constructor(private api: ApiService) {
    this.pollInfo().catch(this.logger.error);
  }

  public async pollInfo(): AsyncFailable<ServerInfo> {
    const response = await this.api.get(InfoResponse, '/api/info');
    if (HasFailed(response)) return response;

    const info = new ServerInfo();
    info.production = response.production;
    info.demo = response.demo;

    this.infoSubject.next(info);
    return info;
  }
}