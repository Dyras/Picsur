import { BullModule } from '@nestjs/bull';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import ms from 'ms';
import { SysPreference } from 'picsur-shared/dist/dto/sys-preferences.enum';
import { HasFailed } from 'picsur-shared/dist/types';
import { ImageDBModule } from '../../collections/image-db/image-db.module';
import { ImageDBService } from '../../collections/image-db/image-db.service';
import { ImageFileDBService } from '../../collections/image-db/image-file-db.service';
import { PreferenceDbModule } from '../../collections/preference-db/preference-db.module';
import { SysPreferenceDbService } from '../../collections/preference-db/sys-preference-db.service';
import { ConvertConsumer } from './convert.consumer';
import { ConvertService } from './convert.service';
import { ImageConverterService } from './image-converter.service';
import { ImageManagerService } from './image-manager.service';
import {
  ImageConvertQueueID,
  ImageIngestQueueID,
} from './image.queue';
import { IngestConsumer } from './ingest.consumer';
import { IngestService } from './ingest.service';

@Module({
  imports: [
    ImageDBModule,
    PreferenceDbModule,
    BullModule.registerQueue({
      name: ImageConvertQueueID,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    BullModule.registerQueue({
      name: ImageIngestQueueID,
    }),
  ],
  providers: [
    ImageManagerService,
    ImageConverterService,
    IngestConsumer,
    ConvertConsumer,
    IngestService,
    ConvertService,
  ],
  exports: [
    ImageManagerService,
    ImageConverterService,
    IngestService,
    ConvertService,
  ],
})
export class ImageManagerModule implements OnModuleInit {
  private readonly logger = new Logger(ImageManagerModule.name);

  constructor(
    private readonly prefManager: SysPreferenceDbService,
    private readonly imageFileDB: ImageFileDBService,
    private readonly imageDB: ImageDBService,
  ) {}

  async onModuleInit() {
    await this.imageManagerCron();
  }

  @Interval(1000 * 60)
  private async imageManagerCron() {
    await this.cleanupDerivatives();
    await this.cleanupExpired();
  }

  private async cleanupDerivatives() {
    const remove_derivatives_after = await this.prefManager.getStringPreference(
      SysPreference.RemoveDerivativesAfter,
    );
    if (HasFailed(remove_derivatives_after)) {
      this.logger.warn('Failed to get remove_derivatives_after preference');
      return;
    }

    let after_ms = ms(remove_derivatives_after as any);
    if (isNaN(after_ms) || after_ms === 0) {
      this.logger.log('remove_derivatives_after is 0, skipping cron');
      return;
    }
    if (after_ms < 60000) after_ms = 60000;

    const result = await this.imageFileDB.cleanupDerivatives(after_ms / 1000);
    if (HasFailed(result)) {
      result.print(this.logger);
    }

    if (result > 0) this.logger.log(`Cleaned up ${result} derivatives`);
  }

  private async cleanupExpired() {
    const cleanedUp = await this.imageDB.cleanupExpired();

    if (HasFailed(cleanedUp)) {
      cleanedUp.print(this.logger);
      return;
    }

    if (cleanedUp > 0)
      this.logger.log(`Cleaned up ${cleanedUp} expired images`);
  }
}
