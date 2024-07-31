import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGnoNativeContext } from '@gnolang/gnonative';
import { compressImage } from '@gno/utils/file-utils';
import { reloadAvatar, saveAvatar, selectAccount, selectAvatar, useAppDispatch, useAppSelector } from "@gno/redux";
import Avatar from './avatar';

const AvatarPicker: React.FC = () => {
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const { gnonative } = useGnoNativeContext();

  const account = useAppSelector(selectAccount);
  const avatarBase64 = useAppSelector(selectAvatar);

  const dispatch = useAppDispatch();

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

      const imageCompressed = await compressImage(imagePath)
      if (!imageCompressed || !mimeType || !imageCompressed.base64) {
        console.log("Error compressing image or missing data");
        return;
      }
      await dispatch(saveAvatar({ mimeType, base64: imageCompressed.base64 })).unwrap();

      await dispatch(reloadAvatar()).unwrap();
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
