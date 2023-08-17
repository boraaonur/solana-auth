import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "./hooks/useAuth";
import { Box, Button, Center, HStack, VStack } from "@chakra-ui/react";

import {
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from "@chakra-ui/react";
import { useEffect } from "react";
import CustomWalletModal from "./components/WalletModal";
import { auth } from "./lib/firebase";

const steps = [
  {
    title: "Step 1: Connect Wallet",
    description: "Initiate the login process by connecting your Solana wallet.",
  },
  {
    title: "Step 2: Sign Nonce",
    description:
      "To confirm your wallet's ownership, please sign a unique message (nonce).",
  },
  {
    title: "Step 3: Signature Verification",
    description:
      "Hold on a moment while we verify the signature. Once confirmed, you'll be securely logged in.",
  },
];

function App() {
  const wallet = useWallet();
  const { authenticate, user, authenticating } = useAuth();
  const { activeStep, setActiveStep, goToNext } = useSteps({
    index: 0,
    count: steps.length,
  });

  function resetProgress() {
    auth.signOut();
    wallet.disconnect();
    setActiveStep(0);
  }

  useEffect(() => {
    if (wallet.connected) {
      setActiveStep(1);
    }

    if (wallet.connected === false) {
      setActiveStep(0);
    }

    if (user) {
      setActiveStep(2);
      goToNext();
    }
  }, [wallet, user]);

  return (
    <>
      <Center w="100vw" h="100vh" bg="gray.800" p="36">
        <HStack w="full" h="full" justify="space-evenly">
          <Stepper
            w="50%"
            index={activeStep}
            orientation="vertical"
            height="400px"
            gap="0"
          >
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
            <HStack mt="10" spacing="4">
              {activeStep !== 0 && (
                <Button onClick={resetProgress}>Reset Progress</Button>
              )}
              {wallet.connected && (
                <Button
                  onClick={() => {
                    wallet.disconnect();
                  }}
                >
                  Disconnect
                </Button>
              )}
            </HStack>
          </Stepper>
          <Box w="50%">
            {activeStep === 0 && (
              <VStack>
                <CustomWalletModal />
              </VStack>
            )}

            {activeStep === 1 && (
              <VStack>
                {authenticating ? (
                  <p>Authenticating...</p>
                ) : (
                  <Button
                    onClick={async () => {
                      if (!wallet.publicKey || !wallet) {
                        throw Error("You must connect your wallet!");
                      }

                      authenticate(wallet);
                    }}
                  >
                    Sign nonce
                  </Button>
                )}
              </VStack>
            )}

            {activeStep >= 2 && (
              <VStack>
                <p>You are logged in. This is the end of demo.</p>
                <p>UID: {user?.uid}</p>
              </VStack>
            )}
          </Box>
        </HStack>
      </Center>
    </>
  );
}

export default App;

/*
Installed = 'Installed',
NotDetected = 'NotDetected',

Loadable = 'Loadable',

Unsupported = 'Unsupported',
*/

/*
            {activeStep === 1 && (
              <VStack>
                <Button
                  onClick={() => {
                    //
                    connect();
                  }}
                >
                  {wallet?.readyState === "NotDetected"
                    ? "Install Wallet"
                    : "Connect Wallet"}
                </Button>
                {wallet?.readyState === "NotDetected" && (
                  <Box p="4" borderRadius="8px">
                    Wallet is not detected on your browser.
                  </Box>
                )}
              </VStack>
            )}
            */
