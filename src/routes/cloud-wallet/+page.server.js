import NeucronSDK from "neucron-sdk";

export const actions = {
  login: async ({ request }) => {
    const data = await request.formData();

    const neucron = new NeucronSDK();

    const authModule = neucron.authentication;
    const walletModule = neucron.wallet;

    const loginResponse = await authModule.login({
      email: data.get("email") as string,
      password: data.get("password") as string,
    });
    console.log(loginResponse);

    const DefaultWalletBalance = await walletModule.getWalletBalance({});

    return {
      auth: true,
      balance: DefaultWalletBalance.data.balance.summary,
    };
  },
  pay: async ({ request }) => {
    const data = await request.formData();

    const neucron = new NeucronSDK();

    const authModule = neucron.authentication;

    await authModule.login({
      email: data.get("email") as string,
      password: data.get("password") as string,
    });

    const paymail = data.get('paymail') as string;
    const amount = Number(data.get('amount'));

    const options = {
      outputs: [
        {
          address: paymail,
          note: "gurudakshina",
          amount: amount,
        },
      ],
    };
    
    try {
      const payResponse = await neucron.pay.txSpend(options);
      console.log(payResponse);
      return { success: true, payResponse: payResponse.data.txid };
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        return { success: false, payResponse: error.message };
      } else {
        return { success: false, payResponse: 'An unknown error occurred' };
      }
    }
  },
};