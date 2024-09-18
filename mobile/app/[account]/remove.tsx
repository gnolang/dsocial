import { selectFollowers } from "redux/features/profileSlice";
import { logedOut, useAppDispatch, useAppSelector } from "@gno/redux";
import { User } from "@gno/types";
import RemoveAccountContent from "@gno/components/view/account/remove-account.tsx";
import { useGnoNativeContext } from "@gnolang/gnonative";

export default function Page() {
  const { gnonative } = useGnoNativeContext();
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectFollowers);

  const onConfirm = async (item: User) => {
    await gnonative.deleteAccount(item.bech32, undefined, true);

    dispatch(logedOut());
  };

  return <RemoveAccountContent data={data} onConfirm={onConfirm} />;
}
