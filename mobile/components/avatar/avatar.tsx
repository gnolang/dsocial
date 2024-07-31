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

const SIZE = 80;

const styles = StyleSheet.create({
  image: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE,
  },
});

export default Avatar;
