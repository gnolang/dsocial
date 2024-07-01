// @generated by protoc-gen-es v1.10.0
// @generated from file notificationservice.proto (package land.gno.dsocial.notificationservice.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { proto3 } from "@bufbuild/protobuf";

/**
 * The ErrCode enum defines errors for gRPC API functions. These are converted
 * from the Go error types returned by gnoclient.
 *
 * ----------------
 * Special errors
 * ----------------
 *
 * @generated from enum land.gno.dsocial.notificationservice.v1.ErrCode
 */
export const ErrCode = /*@__PURE__*/ proto3.makeEnum(
  "land.gno.dsocial.notificationservice.v1.ErrCode",
  [
    {no: 0, name: "Undefined"},
    {no: 1, name: "TODO"},
    {no: 2, name: "ErrNotImplemented"},
    {no: 3, name: "ErrInternal"},
    {no: 100, name: "ErrInvalidInput"},
    {no: 101, name: "ErrMissingInput"},
    {no: 102, name: "ErrSerialization"},
    {no: 103, name: "ErrDeserialization"},
    {no: 104, name: "ErrInitService"},
    {no: 105, name: "ErrRunGRPCServer"},
    {no: 200, name: "ErrDB"},
    {no: 201, name: "ErrDBNotFound"},
  ],
);

/**
 * @generated from message land.gno.dsocial.notificationservice.v1.RegisterDeviceRequest
 */
export const RegisterDeviceRequest = /*@__PURE__*/ proto3.makeMessageType(
  "land.gno.dsocial.notificationservice.v1.RegisterDeviceRequest",
  () => [
    { no: 1, name: "address", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "token", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 * @generated from message land.gno.dsocial.notificationservice.v1.RegisterDeviceResponse
 */
export const RegisterDeviceResponse = /*@__PURE__*/ proto3.makeMessageType(
  "land.gno.dsocial.notificationservice.v1.RegisterDeviceResponse",
  [],
);

/**
 * @generated from message land.gno.dsocial.notificationservice.v1.HelloRequest
 */
export const HelloRequest = /*@__PURE__*/ proto3.makeMessageType(
  "land.gno.dsocial.notificationservice.v1.HelloRequest",
  () => [
    { no: 1, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 * @generated from message land.gno.dsocial.notificationservice.v1.HelloResponse
 */
export const HelloResponse = /*@__PURE__*/ proto3.makeMessageType(
  "land.gno.dsocial.notificationservice.v1.HelloResponse",
  () => [
    { no: 1, name: "greeting", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 * @generated from message land.gno.dsocial.notificationservice.v1.HelloStreamRequest
 */
export const HelloStreamRequest = /*@__PURE__*/ proto3.makeMessageType(
  "land.gno.dsocial.notificationservice.v1.HelloStreamRequest",
  () => [
    { no: 1, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 * @generated from message land.gno.dsocial.notificationservice.v1.HelloStreamResponse
 */
export const HelloStreamResponse = /*@__PURE__*/ proto3.makeMessageType(
  "land.gno.dsocial.notificationservice.v1.HelloStreamResponse",
  () => [
    { no: 1, name: "greeting", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 * @generated from message land.gno.dsocial.notificationservice.v1.ErrDetails
 */
export const ErrDetails = /*@__PURE__*/ proto3.makeMessageType(
  "land.gno.dsocial.notificationservice.v1.ErrDetails",
  () => [
    { no: 1, name: "codes", kind: "enum", T: proto3.getEnumType(ErrCode), repeated: true },
  ],
);

