import ShieldIllustration from '@/assets/tabler-illustrations/svg/dark/shield.svg';
import SignInForm from '@/components/forms/signIn';
import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react';

export default function AuthPage() {
  return (
    <Container maxW="5xl" py={10} px={8}>
      <Flex gap={4}>
        <Box flex={1}>
          <Heading as="h1" size="4xl" fontWeight="black" mb={4}>
            Sign In
          </Heading>
          <Text fontSize="md" color="fg.muted" mb={8}>
            Welcome back! Please sign in to your account to access Passman
          </Text>
          <Box w="full" maxW="md" minW={0}>
            <SignInForm />
          </Box>
        </Box>
        <Flex
          display={{ base: 'none', lg: 'flex' }}
          flex={1}
          direction="column"
          gap={4}
          alignSelf="center"
          justifyContent="center"
        >
          <Box
            color="yellow.solid"
            display={{ base: 'none', lg: 'flex' }}
            alignItems="center"
            justifyContent="center"
            maxW="xl"
            minW={0}
          >
            <ShieldIllustration
              viewBox="0 0 800 600"
              style={{
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </Box>
        </Flex>
      </Flex>
    </Container>
  );
}
