import LoginRedirectButton from '@/components/loginRedirectButton';
import Navbar from '@/components/navbar';
import { Box, Button, Card, Container, Flex, Link, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import crypto from 'crypto';
import NextLink from 'next/link';
import { TbBarrierBlock, TbHome, TbLogin2 } from 'react-icons/tb';

const hexBackground = crypto.randomBytes(6000).toString('hex');

export default function Unauthorized() {
  return (
    <Flex direction="column" h="full" minH="100vh" bg="bg">
      <Navbar user={null} href="/" />
      <Container
        maxW="5xl"
        py={10}
        px={8}
        flex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
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

        <Card.Root w="full" maxW="lg" mx="auto" variant="elevated">
          <Card.Header>
            <VStack justify="space-between" align="center">
              <Box bg="red.subtle" color="red.fg" p={2} borderRadius="md" fontSize="3xl">
                <TbBarrierBlock />
              </Box>
              <Card.Title>Unauthorized Access</Card.Title>
            </VStack>
          </Card.Header>
          <Card.Body>
            <Card.Description lineHeight="tall">
              Your request has been interrupted because you are not authorized to access this page. Your session may
              have expired or you may not have signed in yet. If you continue to experience issues, please{' '}
              <Link href="/support">contact support</Link> for assistance.
            </Card.Description>
          </Card.Body>
          <Card.Footer>
            <SimpleGrid columns={2} gap={4} w="full">
              <LoginRedirectButton colorPalette="yellow" size="lg" w="full">
                <TbLogin2 />
                Sign In
              </LoginRedirectButton>
              <NextLink href="/" passHref>
                <Button colorPalette="yellow" variant="surface" size="lg" w="full">
                  <TbHome />
                  Go Home
                </Button>
              </NextLink>
            </SimpleGrid>
          </Card.Footer>
        </Card.Root>
      </Container>
    </Flex>
  );
}
