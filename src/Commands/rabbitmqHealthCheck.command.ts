import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { RmqOptions, Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus';

interface RabbitHealthCheckOptions {
  uri: string;
}

@Command({
  name: 'rabbitMQ',
  description: 'rabbitMQ service healthCheck',
})
export class RabbitHealthCheckCommand extends CommandRunner {
  constructor(
    private healthCheckService: HealthCheckService,
    private http: HttpHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {
    super();
  }

  @HealthCheck()
  async run(
    inputs: string[],
    options: RabbitHealthCheckOptions,
  ): Promise<void> {
    const { connectionUri } = options;
    const result = this.healthCheckService.check([
      async (): Promise<HealthIndicatorResult> =>
        this.microservice.pingCheck<RmqOptions>('rabbitmq', {
          transport: Transport.RMQ,
          options: {
            urls: [
              {
                protocol: 'amqp',
                username: 'schoollink',
                password: 'K32KbKmdPvvAPV',
                hostname: '192.168.181.103',
                port: 15672,
                vhost: '%2f',
              },
            ],
            queue: 'MessageProcessDelivery',
            queueOptions: {
              durable: false,
            },
          },
        }),
    ]);

    // const result = this.healthCheckService.check([
    //   () => this.http.pingCheck('rabbitMQ-domain', 'http://localhost:15672'),
    // ]);

    Logger.log(result);
  }

  @Option({ flags: '-u, --uri <uri>' })
  parseUri(val: string) {
    return val;
  }
}
