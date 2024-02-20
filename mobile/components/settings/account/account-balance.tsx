import React, { useEffect, useState } from "react";
import { KeyInfo } from "@gno/api/gnonativetypes_pb";
import Text from "@gno/components/text";
import { useGno } from "@gno/hooks/use-gno";

interface Props {
  activeAccount: KeyInfo | undefined;
}

export function AccountBalance({ activeAccount }: Props) {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);

  const gno = useGno();

  useEffect(() => {
    if (!activeAccount) {
      return;
    }
    gno.addressToBech32(activeAccount.address).then((address) => {
      setAddress(address);
    });
    gno.queryAccount(activeAccount.address).then((balance) => {
      setBalance(JSON.stringify(balance.accountInfo?.coins));
    }).catch((error) => {
     setBalance(JSON.stringify(error));
    });
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
      <Text.HeaderSubtitle>Active Account</Text.HeaderSubtitle>
      <Text.Body>{activeAccount.name}</Text.Body>
      <Text.Subheadline>Address:</Text.Subheadline>
      <Text.Body>{address}</Text.Body>
      <Text.Subheadline>Balance:</Text.Subheadline>
      <Text.Body>{balance}</Text.Body>
    </>
  );
}
