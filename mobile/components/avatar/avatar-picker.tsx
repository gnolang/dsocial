import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { selectAvatar, useAppSelector } from "@gno/redux";
import Avatar from './avatar';

interface Props {
  onChanged: (imagePath: string, mimeType?: string) => void;
}

const AvatarPicker: React.FC<Props> = ({onChanged}) => {
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const avatarBase64 = useAppSelector(selectAvatar);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // compress image for smaller size
    });

    if (!result.canceled) {

      const imagePath = result.assets[0].uri;
      const mimeType = result.assets[0].mimeType;

      onChanged(imagePath, mimeType);
    }
  }

  return (
    <TouchableOpacity onPress={pickImage} >
      {base64Image ? <Avatar uri={base64Image} /> : null}
      {avatarBase64 ? <Avatar uri={avatarBase64} /> : null}
    </TouchableOpacity>
  )
}

export default AvatarPicker
