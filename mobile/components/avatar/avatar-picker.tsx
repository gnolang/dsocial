import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGnoNativeContext } from '@gnolang/gnonative';
import { compressImage } from '@gno/utils/file-utils';
import { loggedIn, selectAccount, useAppDispatch, useAppSelector } from "@gno/redux";
import Avatar from './avatar';
import Button from '../button';

interface Props {
  children: React.ReactNode;
}

const AvatarPicker: React.FC<Props> = ({ children }) => {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);

  const { gnonative } = useGnoNativeContext();
  const account = useAppSelector(selectAccount)

  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/tmp"

  useEffect(() => {
    const loadAvatar = async () => {

    }
    loadAvatar();
  }, []);


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
      if (!imageCompressed) {
        console.log("Error compressing image");
        return;
      }

      try {
        const gasFee = "1000000ugnot";
        const gasWanted = 10000000;

        const args: Array<string> = ["Avatar", String(`data:${mimeType};base64,` + imageCompressed.base64)];
        for await (const response of await gnonative.call("gno.land/r/demo/profile", "SetStringField", args, gasFee, gasWanted)) {
          console.log("response ono post screen: ", response);
        }
      } catch (error) {
        console.error("on post screen", error);
      }
    }
  }

  const loadImage = async () => {
    try {
      const response = await gnonative.qEval("gno.land/r/demo/profile", `GetStringField("${account?.address}","Avatar", "${DEFAULT_AVATAR}")`);
      const parsed = response.substring(2, response.length - "\" string)".length);
      setBase64Image(parsed);
    } catch (error) {
      console.error("Error loading avatar", error);
    }
  }

  return (
    <TouchableOpacity onPress={pickImage} >
      <Button.TouchableOpacity onPress={loadImage} title='Load Image' variant="primary" />
      {base64Image ? <Avatar uri={base64Image} /> : null}
    </TouchableOpacity>
  )
}

export default AvatarPicker
