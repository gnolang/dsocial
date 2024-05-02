import { selectFollowers } from "redux/features/profileSlice";
import { logedOut, useAppDispatch, useAppSelector } from "@gno/redux";
import { User } from "@gno/types";
import RemoveAccountContent from "@gno/components/view/account/remove-account.tsx";
import { useGno } from "@gnolang/gnonative/src/hooks/use-gno";

export default function Page() {
  const gno = useGno();
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectFollowers);

  const onConfirm = async (item: User) => {
    await gno.deleteAccount(item.address, undefined, true);

    dispatch(logedOut());
  };

  return <RemoveAccountContent data={data} onConfirm={onConfirm} />;
}
