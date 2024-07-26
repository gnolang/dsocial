import { View, Image, StyleSheet, StyleProp, ImageStyle } from "react-native";

interface Props {
  uri: string;
  style?: StyleProp<ImageStyle>;
}

const Avatar: React.FC<Props> = ({ uri, style }) => {
  return (
    <View>
      <Image source={{ uri }} style={[styles.image, style]} />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});

export default Avatar;
