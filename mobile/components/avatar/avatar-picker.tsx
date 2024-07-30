import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useGnoNativeContext } from '@gnolang/gnonative';
import * as FileSystem from 'expo-file-system';
import { compressImage, convertImageToBase64 } from '@gno/utils/file-utils';
import { loggedIn, selectAccount, useAppDispatch, useAppSelector } from "@gno/redux";

interface Props {
  children: React.ReactNode;
}

const AvatarPicker : React.FC<Props> = ({children}) => {
  const [image, setImage] = useState<string| null>(null);
  const [compressedImage, setCompressedImage] = useState<string| null>(null);

  const { gnonative } = useGnoNativeContext();
  const account = useAppSelector(selectAccount)

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const response = await gnonative.qEval("gno.land/r/demo/profile", `GetStringField("${account?.address}","Avatar", "")`);
        console.log("response: ", response);
        if (response) {
          setImage(response);
        }
      } catch (error) {
        console.error("Error loading avatar", error);
      }
    }
    loadAvatar();
  });


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // compress image for smaller size
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);

      const imagePath = result.assets[0].uri;
      const imageCompressed = await compressImage(imagePath)
      if (!imageCompressed) {
        console.log("Error compressing image");
        return;
      }

      console.log("compressed image: ", imageCompressed.uri);
      console.log("compressed base64: ", imageCompressed.base64);

      try {
        const gasFee = "1000000ugnot";
        const gasWanted = 10000000;

        const args: Array<string> = ["Avatar", String("data:image/xxx;base64," + imageCompressed.base64)];
        for await (const response of await gnonative.call("gno.land/r/demo/profile", "SetStringField", args, gasFee, gasWanted)) {
          console.log("response ono post screen: ", response);
        }
      } catch (error) {
        console.error("on post screen", error);
      }

    }
  }

  return (
    <TouchableOpacity onPress={pickImage} >
      {children}
    </TouchableOpacity>
  )
}

export default AvatarPicker
