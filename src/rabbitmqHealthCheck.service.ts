import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

interface ConnectionStringComponents {
  protocol: string;
  username: string;
  password: string;
  host: string;
  port: string;
  vhost: string;
  queueName: string;
}

@Injectable()
export class rabbitmqHealthCheckService {
  CLUSTER_METRIC = 'cluster';
  NODES_METRIC = 'nodes';
  QUEUE_METRIC = 'queue';
  PROTOCAL = 'amqp';
  DEFAULT_PORT = '5672';

  constructor(private readonly httpService: HttpService) {}

  async getMetricData(
    uriComponents: ConnectionStringComponents,
    metric?: string,
  ): Promise<any> {
    const { username, password, host, port, queueName, vhost } = uriComponents;

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    let pathUrl = '';

    if (!metric || this.CLUSTER_METRIC === metric) {
      pathUrl = `http://${host}:${port}/api/overview`;
    }

    if (this.NODES_METRIC === metric) {
      pathUrl = `http://${host}:${port}/api/nodes`;
    }

    if (this.QUEUE_METRIC === metric) {
      pathUrl = `http://${host}:${port}/api/queues/${vhost}/${queueName}`;
    }

    try {
      return await lastValueFrom(
        this.httpService
          .get(pathUrl, {
            headers: {
              Authorization: `Basic ${auth}`,
            },
          })
          .pipe(map((res) => res.data)),
      );
    } catch {
      throw new Error('Please check URI credentials \n');
    }
  }

  displayKeyMetric(data: any, metric: string): void {
    if (!metric || this.CLUSTER_METRIC === metric) {
      console.log(
        { queue_totals: data.queue_totals, object_totals: data.object_totals },
        '\n',
      );
    }

    if (this.NODES_METRIC === metric) {
      console.log(
        {
          mem_limit: data[0].mem_limit,
          mem_used: data[0].mem_used,
          disk_free_limit: data[0].disk_free_limit,
        },
        '\n',
      );
    }

    if (this.QUEUE_METRIC === metric) {
      console.log(
        {
          memory: data.memory,
          messages: data.messages,
          messages_ready: data.messages_ready,
          messages_unacknowledged: data.messages_unacknowledged,
        },
        '\n',
      );
    }
  }

  // EX: amqp://user:password@localhost:5672/%2f/queue_name
  parseConnectionString(uri: string): ConnectionStringComponents {
    // Parse the connection string using the URL constructor
    const url = new URL(uri);

    // Extract components
    const protocol = url.protocol.slice(0, -1); // remove the trailing colon
    const username = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = url.port || this.DEFAULT_PORT; // default RabbitMQ port is 5672

    const pathSegments = url.pathname.split('/').filter(Boolean);
    const vhost = pathSegments.length > 0 ? pathSegments[0] : '#';
    const queueName = pathSegments.length > 1 ? pathSegments[1] : '';

    return {
      protocol,
      username,
      password,
      host,
      port,
      vhost,
      queueName,
    };
  }
}
