import { Module } from '@nestjs/common';
import { RabbitHealthCheckCommand } from './rabbitmqHealthCheck.command';

import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TerminusModule, HttpModule],
  providers: [RabbitHealthCheckCommand],
})
export class CommandModule {}
