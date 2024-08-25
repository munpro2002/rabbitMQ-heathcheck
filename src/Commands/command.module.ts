import { Module } from '@nestjs/common';
import { RabbitHealthCheckCommand } from './rabbitmqHealthCheck.command';
import { rabbitmqHealthCheckService } from 'src/rabbitmqHealthCheck.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [RabbitHealthCheckCommand, rabbitmqHealthCheckService],
})
export class CommandModule {}
