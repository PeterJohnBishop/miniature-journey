import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import * as fs from 'node:fs';

export interface ContainerVitals {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  startedAt: string;
  cpuPercent: number;
  memoryUsageMB: number;
  memoryLimitMB: number;
  memoryPercent: number;
  networkRxMB: number;
  networkTxMB: number;
}

// if running in Docker, return container ID
export function detectSelfContainerId(): string | null {
  const isDocker =
    fs.existsSync('/.dockerenv') ||
    (fs.existsSync('/proc/1/cgroup') &&
      fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker'));

  if (!isDocker) return null;

  // By default, Docker sets /etc/hostname to the short container ID
  if (fs.existsSync('/etc/hostname')) {
    const hostname = fs.readFileSync('/etc/hostname', 'utf8').trim();
    if (/^[a-f0-9]{12,64}$/i.test(hostname)) {
      return hostname;
    }
  }
  return null;
}

export class NodeOne implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
  displayName: 'NodeOne',
  name: 'NodeOne',
  icon: 'file:SvgSpinner.svg', // UPDATE!!!
  group: ['transform'],
  version: 1,
  description: 'NodeOne',
  defaults: {
    name: 'NodeOne',
  },
  inputs: [NodeConnectionTypes.Main],
  outputs: [NodeConnectionTypes.Main],
  usableAsTool: true,
  credentials: [
    //{
    //  name: 'friendgridapi',
    //  required: true,
    //},
  ],
		properties: [
			// Resources and operations will go here
		],
	};
	// The execute method will go here
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const returnData: INodeExecutionData[] =[];

    const data = detectSelfContainerId();
    if (data != null) {
      returnData.push({
        json: {
          container_id: data 
        }
      })
      return [returnData];
    };

    return [returnData];
	}
}
