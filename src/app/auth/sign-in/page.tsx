import SignInForm from '@/components/forms/auth/signIn';
import { Box, Card, Container, Flex, Heading, Text } from '@chakra-ui/react';

export default function AuthPage() {
  return (
    <Container maxW="5xl" py={10} px={8} position="relative">
      <Flex gap={4}>
        <Box flex={1} maxW="md" mx="auto">
          <Heading as="h1" size="4xl" fontWeight="black" mb={4} textAlign="center">
            Sign In
          </Heading>
          <Text fontSize="md" color="fg.muted" mb={8} textAlign="center">
            Welcome back! Sign in to access your secure vault
          </Text>
          <Card.Root variant="elevated">
            <Card.Header>
              <Card.Title>Please Sign In to Continue</Card.Title>
            </Card.Header>

            <SignInForm />
          </Card.Root>
        </Box>
      </Flex>
    </Container>
  );
}
