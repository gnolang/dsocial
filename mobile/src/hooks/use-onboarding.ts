import { useGno } from "./use-gno";

const useOnboarding = () => {
  const gno = useGno();

  const onboard = async (name: string, address: Uint8Array) => {
    const address_bech32 = await gno.addressToBech32(address);
    console.log("onboarding %s, with address: %s", name, address_bech32);

    try {
      const hasBalance = await hasCoins(address);

      if (hasBalance) {
        console.log("user %s already has a balance", name);
        return;
      }

      await sendCoins(address_bech32);

      await registerAccount(name);

    } catch (error) {
      console.log("onboard error:", error);
    }
  };

  const registerAccount = async (name: string) => {
    console.log("Registering account %s", name);
    try {
      const gasFee = "10000000ugnot";
      const gasWanted = 20000000;
      const send = "200000000ugnot";
      const args: Array<string> = ["", name, "Profile description"];
      for await (const response of await gno.call("gno.land/r/demo/users", "Register", args, gasFee, gasWanted, send)) {
        console.log("response: ", JSON.stringify(response));
      }
    } catch (error) {
      console.log('error registering account: ', error);
    }
  };

  const hasCoins = async (address: Uint8Array) => {
    try {
      const balance = await gno.queryAccount(address);
      console.log("account balance: %s", balance.accountInfo?.coins);

      if (!balance.accountInfo) return false;

      const hasCoins = balance.accountInfo.coins.length > 0;
      const hasBalance = hasCoins && balance.accountInfo.coins[0].amount > 0;

      return hasBalance;
    } catch (error: any) {
      if (error["rawMessage"] === "ErrUnknownAddress(#206)") return false;
      throw error;
    }
  };

  const sendCoins = async (address: string) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const remote = await gno.getRemote();
    console.log("sending coins to %s on %s", address, remote);

    const raw = JSON.stringify({
      To: address,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    // use regex to replace the PORT from the url for :8545
    const newUrl = remote.replace(/:\d+/, ":8545");

    return fetch(newUrl, requestOptions);
  };

  return { onboard };
};

export default useOnboarding;
