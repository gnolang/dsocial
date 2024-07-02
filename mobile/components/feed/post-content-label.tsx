import { colors } from "@gno/styles/colors";
import React from "react";
import Autolink, { CustomMatcher } from "react-native-autolink";

const PATTERN = /@([a-z]+[_a-z0-9]{5,})/g;

type Props = {
  onMentionPress?: (accountName: string) => void;
  children: string;
};

const PostContentLabel: React.FC<Props> = ({ children, onMentionPress }) => {
  return (
    <Autolink
      text={children}
      email={false}
      url={false}
      matchers={[
        {
          pattern: PATTERN,
          style: { color: colors.blue, fontWeight: "bold" },
          getLinkText: (replacerArgs) => `@${replacerArgs[1]}`,
          onPress: (match) => {
            console.log("Pressed mention1 ", match);

            const accountNameM1 = match.getReplacerArgs()[0];
            const accountName = accountNameM1.replace("@", "");

            onMentionPress ? onMentionPress(accountName) : null;
          },
        },
      ]}
    />
  );
};

export default PostContentLabel;
