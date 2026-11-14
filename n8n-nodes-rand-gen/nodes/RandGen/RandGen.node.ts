import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
// import for execution function 
import { createHash, randomBytes } from 'crypto';

export class RandGen implements INodeType {
	// describe the look and layout of the node here 
  description: INodeTypeDescription = {
		displayName: 'Random String Generator',
		name: 'randGen',
		icon: 'fa:random',
		group: ['transform'],
		version: 1,
		description: 'Generates a random string derived from user input',
		defaults: {
			name: 'Random String Generator',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Input Property',
				name: 'inputKey',
				type: 'string',
				default: 'text',
				description: 'The property in the incoming JSON item to derive the string from',
				required: true,
			},
			{
				displayName: 'Length',
				name: 'length',
				type: 'number',
				default: 16,
				typeOptions: {
					minValue: 4,
					maxValue: 64,
				},
				description: 'Length of the generated hex string',
			},
		],
	};

  // Define the functionality that is executed by the node here.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const inputKey = this.getNodeParameter('inputKey', i) as string;
				const length = this.getNodeParameter('length', i) as number;

				const rawValue = items[i].json[inputKey];
				if (rawValue === undefined || rawValue === null) {
					throw new NodeOperationError(
						this.getNode(),
						`Input property "${inputKey}" is missing on item ${i}`,
						{ itemIndex: i },
					);
				}

				const userInput = String(rawValue);
				const salt = randomBytes(16).toString('hex');

				// Combine user input with random salt and hash into a fixed-length string
				const derived = createHash('sha256')
					.update(`${userInput}:${salt}`)
					.digest('hex')
					.slice(0, length);

				returnData.push({
					json: {
						...items[i].json,
						derivedString: derived,
					},
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
