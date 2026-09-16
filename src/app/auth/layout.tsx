import Navbar from '@/components/navbar';
import { VaultProvider } from '@/hooks/use-vaults';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { Box, Flex, Text } from '@chakra-ui/react';
import crypto from 'crypto';

const hexBackground = crypto.randomBytes(6000).toString('hex');

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await handleGetCurrentUser();
  const user = result.success && result.data ? result.data : null;

  return (
    <VaultProvider userEmail={user?.email || ''}>
      <Flex direction="column" minH="100vh" h="full" position="relative">
        <Navbar user={user} />
        <Box
          position="absolute"
          inset={0}
          zIndex={0}
          pointerEvents="none"
          overflow="hidden"
          userSelect="none"
          opacity={0.15}
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
          }}
        >
          <Text
            fontFamily="mono"
            fontSize="sm"
            lineHeight="1.1"
            wordBreak="break-all"
            color="fg.muted"
            textAlign="justify"
          >
            {hexBackground}
          </Text>
        </Box>
        <Box as="main" flex={1} bg="bg" color="fg">
          {children}
        </Box>
      </Flex>
    </VaultProvider>
  );
}
