import BoyWithKey from '@/assets/tabler-illustrations/svg/dark/boy-with-key.svg';
import LoginRedirectButton from '@/components/loginRedirectButton';
import Navbar from '@/components/navbar';
import { Box, Button, Container, Flex, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { TbHome, TbLogin2 } from 'react-icons/tb';

export default function Unauthorized() {
  return (
    <Flex direction="column" h="full" minH="100vh" bg="bg">
      <Navbar user={null} />
      <Container maxW="5xl" py={10} px={8} flex={1}>
        <Flex gap={4} h="100%" direction={{ base: 'column-reverse', lg: 'row' }} align="center" justify="center">
          <Box flex={1}>
            <Heading as="h1" size="4xl" fontFamily="heading" fontWeight="black" mb={8}>
              Unauthorized Access
            </Heading>

            <Text fontSize="lg" mb={4}>
              You do not have permission to access this page. Please sign in with the appropriate credentials.
            </Text>

            <Flex gap={4} mt={4}>
              <LoginRedirectButton colorPalette="yellow" size="lg">
                <TbLogin2 />
                Sign In
              </LoginRedirectButton>
              <Link href="/" passHref>
                <Button colorPalette="yellow" variant="subtle" size="lg">
                  <TbHome />
                  Go Home
                </Button>
              </Link>
            </Flex>
          </Box>
          <Flex flex={1} direction="column" gap={4} alignSelf="center" justifyContent="center">
            <Box color="yellow.solid" alignItems="center" justifyContent="center" maxW="xl" minW={0}>
              <BoyWithKey
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
    </Flex>
  );
}
