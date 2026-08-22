import DeviceSecurity from '@/assets/tabler-illustrations/svg/dark/device-security.svg';
import LoginRedirectButton from '@/components/loginRedirectButton';
import Navbar from '@/components/navbar';
import { Badge, Box, Button, Container, Flex, Heading, Link, SimpleGrid, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { TbHome, TbLogin2 } from 'react-icons/tb';

export default function Unauthorized() {
  return (
    <Flex direction="column" h="full" minH="100vh" bg="bg">
      <Navbar user={null} href="/" />
      <Container maxW="5xl" py={10} px={8}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
          <Box flex={1}>
            <Badge colorPalette="red" mb={4} size="lg">
              ERROR 401
            </Badge>
            <Heading
              as="h1"
              size={{
                base: '3xl',
                md: '4xl',
                lg: '5xl',
              }}
              fontFamily="heading"
              fontWeight="extrabold"
              mb={8}
            >
              Unauthorized
            </Heading>
            <Text fontSize="lg" mb={8} lineHeight="tall">
              Your request has been interrupted because you are not authorized to access this page. Your session may
              have expired or you may not have signed in yet. If you continue to experience issues, please{' '}
              <Link href="/support">contact support</Link> for assistance.
            </Text>
            <Flex gap={6}>
              <LoginRedirectButton colorPalette="yellow" size="lg">
                <TbLogin2 />
                Sign In
              </LoginRedirectButton>
              <NextLink href="/" passHref>
                <Button colorPalette="yellow" variant="subtle" size="lg">
                  <TbHome />
                  Go Home
                </Button>
              </NextLink>
            </Flex>
          </Box>
          <Flex direction="column" gap={4} alignSelf="center" justifyContent="center">
            <Box color="yellow.solid" alignItems="center" justifyContent="center" maxW="lg" minW={0}>
              <DeviceSecurity
                viewBox="0 0 800 600"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </Box>
          </Flex>
        </SimpleGrid>
      </Container>
    </Flex>
  );
}
