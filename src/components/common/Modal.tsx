import React from "react";
import {
  Modal as RNModal,
  ModalProps,
} from "react-native";

export function Modal(props: ModalProps) {
  return <RNModal {...props} />;
}