import Layout from "@gno/components/layout";
import Text from "@gno/components/text";
import React from "react";
import styled from "styled-components/native";
import Button from "@gno/components/button";
import { useRouter } from "expo-router";

type Props = {
  message?: string;
};

export const ErrorView: React.FC<Props> = ({ message = "Loading" }) => {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate({ pathname: "/home" });
    }
  };

  return (
    <Layout.Container>
      <Layout.Header />
      <Layout.Body>
        <ViewCenter>
          <Text.BodyMedium>{message}</Text.BodyMedium>
          <Button.TouchableOpacity variant="primary" title="Return" onPress={goBack} />
        </ViewCenter>
      </Layout.Body>
    </Layout.Container>
  );
};

const ViewCenter = styled.View`
  height: 100%;
  justify-content: center;
  align-items: center;
`;

export default ErrorView;
