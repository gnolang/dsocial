import { KeyInfo } from "@gnolang/gnonative";
import SideMenuAccountItem from "./account-item";

interface SideMenuAccountListProps {
  accounts: KeyInfo[];
  changeAccount: (account: KeyInfo) => void;
}

const SideMenuAccountList: React.FC<SideMenuAccountListProps> = ({ accounts, changeAccount }) => {
  return accounts.map((account, index) => <SideMenuAccountItem key={index} account={account} changeAccount={changeAccount} />);
};

export default SideMenuAccountList;
