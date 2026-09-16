import SignUpForm from '@/components/forms/auth/signUp';
import { Box, Card, Container, Flex, Heading, Text } from '@chakra-ui/react';

export default function SignUpPage() {
  return (
    <Container maxW="5xl" py={10} px={8} position="relative">
      <Flex gap={4}>
        <Box flex={1} maxW="md" mx="auto">
          <Heading as="h1" size="4xl" fontWeight="black" mb={4} textAlign="center">
            Sign Up
          </Heading>
          <Text fontSize="md" color="fg.muted" mb={8} textAlign="center">
            Create your account to start using Passman and take total control of your digital security.
          </Text>

          <Card.Root variant="elevated">
            <Card.Header>
              <Card.Title>Welcome to Passman!</Card.Title>
            </Card.Header>
            <SignUpForm />
          </Card.Root>
        </Box>
      </Flex>
    </Container>
  );
}
