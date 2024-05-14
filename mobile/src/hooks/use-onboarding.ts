import { useGnoNativeContext } from "@gnolang/gnonative";

const useOnboarding = () => {
  const gno = useGnoNativeContext();

  const onboard = async (name: string, address: Uint8Array) => {
    const address_bech32 = await gno.addressToBech32(address);
    console.log("onboarding %s, with address: %s", name, address_bech32);

    try {
      const hasBalance = await hasCoins(address);

      if (hasBalance) {
        console.log("user %s already has a balance", name);
        await registerAccount(name);
        return;
      }

      const response = await sendCoins(address_bech32);
			console.log("sent coins %s", response);

      await registerAccount(name);
    } catch (error) {
      console.error("onboard error", error);
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
      console.error("error registering account", error);
    }
  };

  const hasCoins = async (address: Uint8Array) => {
    try {
      console.log("checking if user has balance");
      const balance = await gno.queryAccount(address);
      console.log("account balance: %s", balance.accountInfo?.coins);

      if (!balance.accountInfo) return false;

      const hasCoins = balance.accountInfo.coins.length > 0;
      const hasBalance = hasCoins && balance.accountInfo.coins[0].amount > 0;

      return hasBalance;
    } catch (error: any) {
      console.error("error on hasBalance", error["rawMessage"]);
      if (error["rawMessage"] === "invoke bridge method error: unknown: ErrUnknownAddress(#206)") return false;
      return false;
    }
  };

  const sendCoins = async (address: string) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const remote = await gno.getRemote();

    const raw = JSON.stringify({
      To: address,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const faucetRemote = process.env.EXPO_PUBLIC_FAUCET_REMOTE;
    if (!faucetRemote) {
      throw new Error("faucet remote address is undefined");
    }

    console.log("sending coins to %s on %s", address, faucetRemote);

    return fetch(faucetRemote, requestOptions);
  };

  return { onboard };
};

export default useOnboarding;
