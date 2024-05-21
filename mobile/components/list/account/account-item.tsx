import Button from "@gno/components/button";
import Spacer from "@gno/components/spacer";
import { GnoAccount } from "@gnolang/gnonative/build/hooks/types";

interface SideMenuAccountItemProps {
  account: GnoAccount;
  changeAccount: (account: GnoAccount) => void;
}

const SideMenuAccountItem = (props: SideMenuAccountItemProps) => {
  const { account, changeAccount } = props;
  return (
    <>
      <Spacer />
      <Button.TouchableOpacity title={account.name} onPress={() => changeAccount(account)} variant="primary" />
    </>
  );
};

export default SideMenuAccountItem;
