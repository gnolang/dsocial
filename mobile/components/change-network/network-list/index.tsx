import NetworkListItem from "../network-list-item";
import styled from "styled-components/native";
import Text from "components/text";
import { NetworkMetainfo } from "@gnolang/gnonative/build/hooks/types";

interface Props {
  currentChainId: string | undefined;
  networkMetainfos: NetworkMetainfo[];
  onNetworkChange: (networkMetainfo: NetworkMetainfo) => void;
}

const NetworkList: React.FC<Props> = ({ currentChainId, networkMetainfos = [], onNetworkChange }: Props) => {
  if (networkMetainfos.length === 0) {
    return <Text.Body>No network found.</Text.Body>;
  }

  return (
    <NetworkListWrapper>
      {networkMetainfos.map((networkMetainfo, idx) => (
        <NetworkListItem
          key={idx}
          networkMetainfo={networkMetainfo}
          currentChainId={currentChainId}
          onPress={(item) => onNetworkChange(item)}
        />
      ))}
    </NetworkListWrapper>
  );
};

const NetworkListWrapper = styled.View`
  margin-top: 16px;
`;

export default NetworkList;
