import ForgotPasswordForm from '@/components/forms/auth/forgotPassword';
import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react';

export default function ForgotPasswordPage() {
  return (
    <Container maxW="5xl" py={10} px={8} position="relative">
      <Flex gap={4}>
        <Box flex={1} maxW="md" mx="auto">
          <Heading as="h1" size="4xl" fontWeight="black" mb={4} textAlign="center">
            Account Recovery
          </Heading>
          <Text fontSize="md" color="fg.muted" mb={8} textAlign="center">
            We can help you regain access to your account.
          </Text>
          <Box w="full" maxW="md" minW={0}>
            <ForgotPasswordForm />
          </Box>
        </Box>
      </Flex>
    </Container>
  );
}
