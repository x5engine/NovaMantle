declare module '@embedapi/core' {
  export default class EmbedAPIClient {
    constructor(apiKey: string);
    generate(options: any): Promise<any>;
    stream(options: any): Promise<any>;
  }
}

