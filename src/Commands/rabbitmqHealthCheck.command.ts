import { Command, CommandRunner, Option } from 'nest-commander';
import { rabbitmqHealthCheckService } from '../rabbitmqHealthCheck.service';

interface RabbitHealthCheckOptions {
  uri: string;
  metric?: string;
}

@Command({
  name: 'rabbitMQ',
  description: 'rabbitMQ service healthCheck',
})
export class RabbitHealthCheckCommand extends CommandRunner {
  CLUSTER_METRIC = 'cluster';
  NODES_METRIC = 'nodes';
  QUEUE_METRIC = 'queue';
  PROTOCAL = 'amqp';
  DEFAULT_PORT = '5672';
  AVAILABLE_OPTIONS = [
    this.CLUSTER_METRIC,
    this.NODES_METRIC,
    this.QUEUE_METRIC,
  ];

  constructor(private rabbitMQHealthCheckService: rabbitmqHealthCheckService) {
    super();
  }

  async run(
    _inputs: string[],
    options: RabbitHealthCheckOptions,
  ): Promise<void> {
    const { metric, uri } = options;

    if (metric && !this.AVAILABLE_OPTIONS.includes(metric)) {
      throw new Error(`Unsport metric: ${metric} \n`);
    }

    const uriComponents =
      this.rabbitMQHealthCheckService.parseConnectionString(uri);

    if (this.PROTOCAL !== uriComponents.protocol) {
      throw new Error(`Unsupport Uri protocal: ${uriComponents.protocol} \n`);
    }

    const res = await this.rabbitMQHealthCheckService.getMetricData(
      uriComponents,
      metric,
    );

    this.rabbitMQHealthCheckService.displayKeyMetric(res, metric);

    return;
  }

  @Option({ flags: '-m, --metric <metric>' })
  parseMetric(val: string): string {
    return val;
  }

  @Option({ flags: '-u, --uri <uri>' })
  parseUri(val: string): string {
    return val;
  }
}
