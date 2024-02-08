import { useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { GnoAccount } from "@gno/native_modules/types";
import { useGno } from "@gno/hooks/use-gno";
import Loading from "@gno/components/loading";
import Layout from "@gno/components/layout";
import Text from "@gno/components/text";
import SideMenuAccountList from "@gno/components/list/account/account-list";

const RemoveAccount = () => {
  const gno = useGno();
  const navigation = useNavigation();
  const [loading, setLoading] = useState<string | undefined>(undefined);
  const [accounts, setAccounts] = useState<GnoAccount[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        setLoading("Loading accounts...");
        const response = await gno.listKeyInfo();

        setAccounts(response);
        setLoading(undefined);
      } catch (error: unknown | Error) {
        setLoading(error?.toString());
        console.log(error);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const onChangeAccountHandler = async (account: GnoAccount) => {
    console.log("account: ", account);
    router.push({ pathname: "settings/remove-account/confirm", params: { accountName: account.name } });
  };

  if (loading) return <Loading message={loading} />;

  return (
    <Layout.Container>
      <Layout.Header />
      <Layout.Body>
        <Text.Title>Remove Account</Text.Title>
        {accounts.length === 0 ? <Text.Body>No accounts found</Text.Body> : null}
        <SideMenuAccountList accounts={accounts} changeAccount={onChangeAccountHandler} />
      </Layout.Body>
    </Layout.Container>
  );
};

export default RemoveAccount;
