import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe-decorator';
import { Permission } from 'picsur-shared/dist/dto/permissions.enum';
import { HasFailed } from 'picsur-shared/dist/types';
import { UserPassModel } from 'src/app/models/forms-dto/userpass.dto';
import { PermissionService } from 'src/app/services/api/permission.service';
import { UserService } from 'src/app/services/api/user.service';
import { Logger } from 'src/app/services/logger/logger.service';
import { ErrorService } from 'src/app/util/error-manager/error.service';
import { LoginControl } from '../../../models/forms/login.control';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private readonly logger = new Logger(LoginComponent.name);

  public showRegister = false;
  public loading = false;

  public readonly model = new LoginControl();

  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly router: Router,
    private readonly errorService: ErrorService,
  ) {}

  ngOnInit(): void {
    const state = history.state as UserPassModel;
    if (state) {
      this.model.putData(state);
      history.replaceState(null, '');
    }

    this.onPermissions();
  }

  @AutoUnsubscribe()
  onPermissions() {
    return this.permissionService.live.subscribe((permissions) => {
      this.showRegister = permissions.includes(Permission.UserRegister);
    });
  }

  async onSubmit() {
    const data = this.model.getData();
    if (HasFailed(data)) {
      return;
    }

    this.loading = true;
    const user = await this.userService.login(data.username, data.password);
    this.loading = false;

    if (HasFailed(user))
      return this.errorService.showFailure(user, this.logger);

    this.errorService.success('Login successful');
    this.router.navigate(['/']);
  }

  async onRegister() {
    this.router.navigate(['/user/register'], {
      state: this.model.getRawData(),
    });
  }
}
