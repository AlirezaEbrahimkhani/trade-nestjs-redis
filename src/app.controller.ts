import { CACHE_MANAGER, Controller, Delete, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Controller()
export class AppController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Delete('flush')
  async flushDB() {
    await this.cacheManager.reset();
  }
}
