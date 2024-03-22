import Layout from "@gno/components/layout";
import ModalHeader from "@gno/components/layout/modal-header";
import FollowsList from "@gno/components/list/follows/follows-list";
import Text from "@gno/components/text";
import { Following } from "@gno/types";
import { StyleSheet, View } from "react-native";

interface Props {
  data: Following[];
  onPress: (item: Following) => void;
}

function FollowModalContent({ data, onPress }: Props) {
  return (
    <View style={styles.container}>
      <ModalHeader>
        <Text.Title>Following</Text.Title>
      </ModalHeader>
      <Layout.Body>
        <FollowsList data={data} onPress={onPress} />
      </Layout.Body>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
  },
});

export default FollowModalContent;
