import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export async function convertImageToBase64(imagePath: string): Promise<string | undefined> {
  try {
    const base64Image = await FileSystem.readAsStringAsync(imagePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64Image;
  } catch (error) {
    console.error("Error reading image as base64:", error);
  }
}

export async function compressImage(imagePath: string, maxSizeKB: number = 200): Promise<{ base64?: string, uri: string } | undefined> {
  try {

    let quality = 0.1;
    let compressedUri = imagePath;
    let fileSizeInKB = await getFileSizeInKB(compressedUri);

    console.log("Original image size: %s, quality: %s", fileSizeInKB, quality);

    const data = await ImageManipulator.manipulateAsync(
      imagePath,
      [{ resize: { height: 200 } }],
      {
        compress: quality, format: ImageManipulator.SaveFormat.JPEG,
        // return base64 image:
        base64: true
      }
    );
    compressedUri = data.uri;
    fileSizeInKB = await getFileSizeInKB(compressedUri);

    if (fileSizeInKB && fileSizeInKB > maxSizeKB) {
      console.error("Unable to compress image to desired size. Current size:", fileSizeInKB);
      return undefined
    }

    return { base64: data.base64, uri: compressedUri };

  } catch (error) {
    console.error(error);
    return undefined
  }
};

async function getFileSizeInKB(uri: string): Promise<number | undefined> {
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) return info.size / 1024;
  return undefined;
};
