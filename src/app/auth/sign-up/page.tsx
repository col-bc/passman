import FingerprintIllustration from '@/assets/tabler-illustrations/svg/dark/fingerprint.svg';
import SignUpForm from '@/components/forms/signUp';
import { Badge, Box, Container, Flex, Heading, Text } from '@chakra-ui/react';
import { TbArrowsExchange, TbEyeOff, TbListDetails } from 'react-icons/tb';

export default function SignUpPage() {
  return (
    <Container maxW="5xl" py={10} px={8}>
      <Flex gap={4}>
        <Box flex={1}>
          <Heading as="h1" size="4xl" fontWeight="black" mb={4}>
            Sign Up
          </Heading>
          <Text fontSize="md" color="fg.muted" mb={8}>
            Create your account to start using Passman and securely manage your passwords and sensitive information with
            ease.
          </Text>

          <Box w="full" maxW="md" minW={0}>
            <SignUpForm />
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
          <Heading as="h2" size="2xl" color="fg.muted" textAlign="center" fontWeight="bold" mb={4} mt={8}>
            Welcome to Passman
          </Heading>
          <Flex justifyContent="center" alignItems="center" gap={2}>
            <Badge colorPalette="yellow" variant="subtle" rounded="full">
              <TbListDetails size={16} />
              Customizable
            </Badge>
            <Badge colorPalette="yellow" variant="subtle" rounded="full">
              <TbEyeOff size={16} />
              Private
            </Badge>
            <Badge colorPalette="yellow" variant="subtle" rounded="full">
              <TbArrowsExchange size={16} />
              E2E Encrypted
            </Badge>
          </Flex>
          <Box
            color="yellow.solid"
            display={{ base: 'none', lg: 'flex' }}
            alignItems="center"
            justifyContent="center"
            maxW="xl"
            minW={0}
          >
            <FingerprintIllustration
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
