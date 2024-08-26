import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Image,
  Box,
} from "@chakra-ui/react";

const ImageModal = ({ isOpen, onClose, imgSrc }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
    <ModalOverlay />
    <ModalContent
      maxWidth="100vw"
      maxHeight="100vh"
      margin="0"
      padding="0"
      borderRadius="0"
      overflow="hidden"
      bg={"black"}
    >
      <ModalCloseButton color={"white"} />
      <ModalBody
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding="0"
        margin="0"
        height="100%"
      >
        <Box
          width="auto"
          height="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Image src={imgSrc} height="100vh" objectFit="contain" />
        </Box>
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default ImageModal;
