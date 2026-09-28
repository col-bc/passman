import SignInForm from '@/components/forms/auth/signIn';
import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react';

export default function AuthPage() {
  return (
    <Container maxW="5xl" py={10} px={8} position="relative">
      <Flex gap={4}>
        <Box flex={1} maxW="md" mx="auto">
          <Heading as="h1" size="4xl" fontWeight="semibold" mb={4} textAlign="center">
            Sign In
          </Heading>
          <Text fontSize="md" color="fg.muted" mb={8} textAlign="center">
            Welcome back! Enter your credentials below to access your vaults.
          </Text>

          <SignInForm />
        </Box>
      </Flex>
    </Container>
  );
}
