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
import { MouseEventHandler, useEffect } from "react";
import CustomWalletModal from "./components/WalletModal";
import { auth } from "./lib/firebase";
import { User } from "firebase/auth";

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

  async function onAuthenticate() {
    if (!wallet.publicKey || !wallet) {
      throw Error("You must connect your wallet!");
    }
    authenticate(wallet);
  }

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
            {activeStep === 0 && <ConnectWalletStep />}
            {activeStep === 1 && (
              <SignNonceStep
                authenticating={authenticating}
                onAuthenticate={onAuthenticate}
              />
            )}
            {activeStep >= 2 && <VerificationStep user={user} />}
          </Box>
        </HStack>
      </Center>
    </>
  );
}

function ConnectWalletStep() {
  return (
    <VStack>
      <CustomWalletModal />
    </VStack>
  );
}

function SignNonceStep({
  authenticating,
  onAuthenticate,
}: {
  authenticating: boolean;
  onAuthenticate: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <VStack>
      {authenticating ? (
        <p>Authenticating...</p>
      ) : (
        <Button onClick={onAuthenticate}>Sign nonce</Button>
      )}
    </VStack>
  );
}

function VerificationStep({ user }: { user: User | null }) {
  return (
    <VStack>
      <p>You are logged in. This is the end of the demo.</p>
      <p>UID: {user?.uid}</p>
    </VStack>
  );
}

export default App;
