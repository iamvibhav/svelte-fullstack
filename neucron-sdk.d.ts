declare module 'neucron-sdk' {
    export default class NeucronSDK {
      authentication: {
        login(options: { email: string; password: string }): Promise<any>;
      };
      wallet: {
        getWalletBalance(options: {}): Promise<{
          data: {
            balance: {
              summary: any;
            };
          };
        }>;
      };
      pay: {
        txSpend(options: {
          outputs: Array<{
            address: string;
            note: string;
            amount: number;
          }>;
        }): Promise<{
          data: {
            txid: string;
          };
        }>;
      };
    }
  }