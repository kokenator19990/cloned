import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class GuestCleanupService {
    private readonly logger = new Logger(GuestCleanupService.name);

    constructor(private authService: AuthService) { }

    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleCleanup() {
        this.logger.log('Running guest cleanup cron...');
        const result = await this.authService.cleanupExpiredGuests();
        if (result.deleted > 0) {
            this.logger.log(`Cleaned ${result.deleted} expired guest(s)`);
        }
    }
}
