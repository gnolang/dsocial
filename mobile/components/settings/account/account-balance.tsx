import React, { useEffect, useState } from "react";
import { KeyInfo } from "@buf/gnolang_gnonative.bufbuild_es/gnonativetypes_pb";
import Text from "@gno/components/text";
import { useGnoNativeContext } from "@gnolang/gnonative";
import { useSearch } from "@gno/hooks/use-search";
import * as Application from "expo-application";

interface Props {
  activeAccount: KeyInfo | undefined;
}

export function AccountBalance({ activeAccount }: Props) {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);

  const { gnonative } = useGnoNativeContext();
  const account = useSearch();

  useEffect(() => {
    (async () => {
      if (!activeAccount) {
        return;
      }

      gnonative.addressToBech32(activeAccount.address).then((address) => {
        setAddress(address);
      });
      gnonative
        .queryAccount(activeAccount.address)
        .then((balance) => {
          setBalance(balance.accountInfo?.coins.reduce((acc, coin) => acc + coin.amount.toString() + coin.denom + " ", ""));
        })
        .catch((error) => {
          console.log("Error on fetching balance", JSON.stringify(error));
          setBalance("Error on fetching balance. Please check the logs.");
        });
    })();
  }, [activeAccount]);

  if (!activeAccount) {
    return (
      <>
        <Text.HeaderSubtitle>Active Account:</Text.HeaderSubtitle>
        <Text.Body style={{ fontSize: 14 }}>No active account.</Text.Body>
      </>
    );
  }

  return (
    <>
      <Text.Subheadline>Version:</Text.Subheadline>
      <Text.Body>{Application.nativeApplicationVersion}</Text.Body>
      <Text.Subheadline>Active Account:</Text.Subheadline>
      <Text.Body>{activeAccount.name}</Text.Body>
      <Text.Subheadline>Address:</Text.Subheadline>
      <Text.Body>{address}</Text.Body>
      <Text.Subheadline>Balance:</Text.Subheadline>
      <Text.Body>{balance}</Text.Body>
    </>
  );
}
