import Layout from "@gno/components/layout";
import Text from "@gno/components/text";
import React from "react";
import styled from "styled-components/native";

type Props = {
  message?: string;
};

export const ErrorView: React.FC<Props> = ({ message = "Loading" }) => {
  return (
    <Layout.Container>
      <Layout.Body>
        <ViewCenter>
          <Text.BodyMedium>{message}</Text.BodyMedium>
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
