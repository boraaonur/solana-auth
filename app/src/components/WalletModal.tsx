import { CloseIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  useDisclosure,
  HStack,
  Text,
  IconButton,
  Center,
  Image,
} from "@chakra-ui/react";

import { SimpleGrid } from "@chakra-ui/react";
import { Adapter } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { wallets } from "../lib/solana";

function CustomWalletModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { select, connect } = useWallet();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Button onClick={onOpen}>Select Wallet</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#151515" minW="680px" p="10" borderRadius="20px">
          <HStack justify="space-between" alignItems="center" w="full">
            <Text>Connect your wallet to cocktail.art</Text>
            <IconButton
              aria-label="Search database"
              icon={<CloseIcon />}
              onClick={onClose}
            />
          </HStack>
          <ModalBody mt="10" bg="#202020" p="4" borderRadius="8px">
            By connecting your wallet, you acknowledge that you have read,
            understand and accept the terms in the Disclaimer
          </ModalBody>

          <SimpleGrid columns={2} spacingY="10px" spacingX="20px" mt="20px">
            {wallets.slice(0, expanded ? undefined : 6).map((adapter) => {
              return (
                <WalletButton
                  key={adapter.name}
                  adapter={adapter}
                  onClick={() => {
                    select(adapter.name);
                    connect();
                    onClose();
                  }}
                />
              );
            })}
          </SimpleGrid>
          <Center mt="20px">
            {!expanded && (
              <Button variant="ghost" onClick={() => setExpanded(true)}>
                Show more
              </Button>
            )}
            {expanded && (
              <Button variant="ghost" onClick={() => setExpanded(false)}>
                Show less
              </Button>
            )}
          </Center>
        </ModalContent>
      </Modal>
    </>
  );
}

function WalletButton(props: {
  adapter: Adapter;
  onClick: React.MouseEventHandler;
}) {
  return (
    <Button
      bg="#202020"
      height="52px"
      borderRadius="8px"
      cursor="pointer"
      onClick={props.onClick}
    >
      <HStack
        h="full"
        w="full"
        justify="start"
        alignItems="center"
        px="6"
        spacing="20px"
      >
        <Image width="28px" height="28px" src={props.adapter.icon} />
        <Text>{props.adapter.name}</Text>
      </HStack>
    </Button>
  );
}

export default CustomWalletModal;
