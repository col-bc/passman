import DetectiveHackerIllustration from '@/assets/tabler-illustrations/svg/dark/device-security.svg';
import Navbar from '@/components/navbar';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { Badge, Box, Button, Card, Container, Flex, GridItem, Heading, List, SimpleGrid, Text } from '@chakra-ui/react';
import crypto from 'crypto';
import Link from 'next/link';
import {
  TbArrowRight,
  TbBlocks,
  TbBuildingBank,
  TbCircleCheckFilled,
  TbCreditCard,
  TbId,
  TbKey,
  TbLock,
  TbPasswordUser,
  TbShieldCheck,
  TbShieldLockFilled,
} from 'react-icons/tb';

export default async function HomePage() {
  const result = await handleGetCurrentUser();
  const hexBackground = crypto.randomBytes(6000).toString('hex');
  const user = result.success ? result.data : null;

  return (
    <>
      <Navbar user={user} />
      <Box as="main" flex={1} bg="bg.surface" color="fg.primary" overflow="hidden">
        {/* HERO SECTION */}
        <Box position="relative" w="full">
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

          <Container maxW="5xl" py={{ base: 20, md: 32 }} px={8} position="relative" zIndex={1}>
            <Flex direction="column" align="center" textAlign="center" gap={8}>
              <Badge
                colorPalette="yellow"
                variant="surface"
                px={4}
                py={1.5}
                rounded="full"
                fontSize="sm"
                letterSpacing="wide"
              >
                Zero-Knowledge Architecture <TbShieldLockFilled />
              </Badge>

              <Heading
                as="h1"
                fontSize={{ base: '5xl', md: '7xl' }}
                fontWeight="extrabold"
                letterSpacing="tighter"
                maxW="4xl"
                lineHeight="1.1"
              >
                Your digital life, <br />
                <Box as="span" color="yellow.emphasized">
                  mathematically
                </Box>{' '}
                protected.
              </Heading>

              <Text fontSize={{ base: 'lg', md: 'xl' }} color="fg" maxW="2xl" lineHeight="relaxed">
                Passman uses military-grade client-side encryption. Your master key never leaves your device,ensuring
                you retain absolute control over your data.
              </Text>

              <Flex direction={{ base: 'column', sm: 'row' }} gap={4} mt={4} w="full" justify="center">
                <Button asChild colorPalette="yellow" size="xl" variant="solid">
                  <Link href={user ? '/locker' : '/auth/sign-up'}>
                    Get Started Free <TbArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl" colorPalette="yellow" bg="bg.surface">
                  <Link href="/auth/sign-in">Sign In to Vault</Link>
                </Button>
              </Flex>
            </Flex>
          </Container>
        </Box>

        {/* TRUST SIGNALS / FEATURES GRID */}
        <Box bg="bg.muted" py={24} borderTopWidth="1px" borderBottomWidth="1px">
          <Container maxW="6xl" px={8}>
            <Flex direction="column" align="center" mb={16} textAlign="center" gap={3}>
              <Heading as="h2" fontSize="4xl" fontWeight="bold" letterSpacing="tight">
                Built for absolute privacy
              </Heading>
              <Text color="fg.muted" fontSize="lg" maxW="xl">
                Everything you store is encrypted before it ever touches our servers.
              </Text>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
              <Card.Root
                variant="outline"
                p={8}
                rounded="xl"
                bg="bg.surface"
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <Card.Body gap={5}>
                  <Flex
                    w={14}
                    h={14}
                    align="center"
                    justify="center"
                    rounded="md"
                    bg="yellow.subtle"
                    color="yellow.fg"
                    fontSize="3xl"
                  >
                    <TbShieldCheck />
                  </Flex>
                  <Heading fontSize="2xl" fontWeight="bold">
                    Client-Side Encryption
                  </Heading>
                  <Text color="fg.muted" fontSize="md" lineHeight="tall">
                    Encryption and decryption happen strictly in your browser RAM using your Master Encryption Key
                    (MEK).
                  </Text>
                </Card.Body>
              </Card.Root>

              <Card.Root
                variant="outline"
                p={8}
                rounded="xl"
                bg="bg.surface"
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <Card.Body gap={5}>
                  <Flex
                    w={14}
                    h={14}
                    align="center"
                    justify="center"
                    rounded="md"
                    bg="yellow.subtle"
                    color="yellow.fg"
                    fontSize="3xl"
                  >
                    <TbKey />
                  </Flex>
                  <Heading fontSize="2xl" fontWeight="bold">
                    Custom Lockers
                  </Heading>
                  <Text color="fg.muted" fontSize="md" lineHeight="tall">
                    Organize your sensitive credentials, financial accounts, and secure notes into custom-tailored
                    encrypted vaults.
                  </Text>
                </Card.Body>
              </Card.Root>

              <Card.Root
                variant="outline"
                p={8}
                rounded="xl"
                bg="bg.surface"
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <Card.Body gap={5}>
                  <Flex
                    w={14}
                    h={14}
                    align="center"
                    justify="center"
                    rounded="md"
                    bg="yellow.subtle"
                    color="yellow.fg"
                    fontSize="3xl"
                  >
                    <TbLock />
                  </Flex>
                  <Heading fontSize="2xl" fontWeight="bold">
                    Zero-Knowledge Proof
                  </Heading>
                  <Text color="fg.muted" fontSize="md" lineHeight="tall">
                    We store only ciphertexts and authentication tags. Without your master password, your data is
                    mathematically unreadable.
                  </Text>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          </Container>
        </Box>

        {/* PROACTIVE DEFENSE SECTION */}
        <Box bg="bg.surface" py={24} borderBottomWidth="1px">
          <Container maxW="5xl" px={8}>
            <Heading as="h2" fontSize="4xl" fontWeight="bold" letterSpacing="tight" mb={4}>
              A Proactive Defense
            </Heading>
            <Text color="fg" fontSize="md" lineHeight="tall" mb={8}>
              Passman continuously monitors your stored credentials for potential security risks, including weak or
              compromised passwords.
            </Text>
            <Flex
              direction={{
                base: 'column',
                lg: 'row',
              }}
              align="center"
              gap={6}
            >
              <Box
                flex={1}
                maxW={{ base: 'full', lg: 'xl' }}
                fontSize={{
                  base: 'md',
                  lg: 'lg',
                }}
              >
                <List.Root gap={3} listStyleType="none" align="center">
                  <List.Item color="fg.muted" lineHeight="tall" display="flex" alignItems="start">
                    <List.Indicator asChild color="yellow.emphasized" fontSize="lg">
                      <TbCircleCheckFilled className="size-8" />
                    </List.Indicator>
                    Real-time security alerts for compromised or weak credentials threats.
                  </List.Item>
                  <List.Item color="fg.muted" lineHeight="tall" display="flex" alignItems="start">
                    <List.Indicator asChild color="yellow.emphasized" fontSize="md">
                      <TbCircleCheckFilled className="size-8" />
                    </List.Indicator>
                    Actionable insights and recommendations to strengthen your digital security.
                  </List.Item>
                  <List.Item color="fg.muted" lineHeight="tall" display="flex" alignItems="start">
                    <List.Indicator asChild color="yellow.emphasized" fontSize="md">
                      <TbCircleCheckFilled className="size-8" />
                    </List.Indicator>
                    Comprehensive reports on your password health password strength and reuse.
                  </List.Item>
                  <List.Item color="fg.muted" lineHeight="tall" display="flex" alignItems="start">
                    <List.Indicator asChild color="yellow.emphasized">
                      <TbCircleCheckFilled className="size-8" />
                    </List.Indicator>
                    Integrated password generator for creating strong, unique passwords for every account.
                  </List.Item>
                </List.Root>
              </Box>
              <Box
                color="yellow.solid"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                maxW="xl"
                minW={0}
              >
                <DetectiveHackerIllustration
                  viewBox="0 0 800 600"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </Box>
            </Flex>
          </Container>
        </Box>

        {/* TEMPLATES PREVIEW SECTION */}
        <Container maxW="5xl" py={24} px={8}>
          <Flex direction="column" align="center" textAlign="center" gap={4} mb={16}>
            <Heading as="h2" fontSize="4xl" fontWeight="bold" letterSpacing="tight">
              Flexible Templates for Every Asset
            </Heading>
            <Text color="fg.muted" fontSize="lg" maxW="2xl">
              Store more than just passwords. Organize complex data structures securely.
            </Text>
          </Flex>

          <SimpleGrid columns={{ base: 2, md: 5 }} gap={6}>
            <Flex
              direction="column"
              align="center"
              p={8}
              rounded="lg"
              borderWidth="1px"
              gap={4}
              bg="bg.subtle"
              _hover={{ borderColor: 'yellow.emphasized', color: 'yellow.fg', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <TbPasswordUser size={40} strokeWidth={1.5} />
              <Text fontWeight="bold" fontSize="lg" textAlign="center">
                Credentials
              </Text>
            </Flex>
            <Flex
              direction="column"
              align="center"
              p={8}
              rounded="lg"
              borderWidth="1px"
              gap={4}
              bg="bg.subtle"
              _hover={{ borderColor: 'yellow.emphasized', color: 'yellow.fg', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <TbCreditCard size={40} strokeWidth={1.5} />
              <Text fontWeight="bold" fontSize="lg" textAlign="center">
                Credit Cards
              </Text>
            </Flex>
            <Flex
              direction="column"
              align="center"
              p={8}
              rounded="lg"
              borderWidth="1px"
              gap={4}
              bg="bg.subtle"
              _hover={{ borderColor: 'yellow.emphasized', color: 'yellow.fg', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <TbBuildingBank size={40} strokeWidth={1.5} />
              <Text fontWeight="bold" fontSize="lg" textAlign="center">
                Bank Accounts
              </Text>
            </Flex>
            <Flex
              direction="column"
              align="center"
              p={8}
              rounded="lg"
              borderWidth="1px"
              gap={4}
              bg="bg.subtle"
              _hover={{ borderColor: 'yellow.emphasized', color: 'yellow.fg', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <TbId size={40} strokeWidth={1.5} />
              <Text fontWeight="bold" fontSize="lg" textAlign="center">
                Identities
              </Text>
            </Flex>
            <GridItem colSpan={{ base: 2, md: 1 }} asChild>
              <Flex
                direction="column"
                align="center"
                p={8}
                rounded="lg"
                borderWidth="1px"
                gap={4}
                bg="bg.subtle"
                _hover={{ borderColor: 'yellow.emphasized', color: 'yellow.fg', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <TbBlocks size={40} strokeWidth={1.5} />
                <Text fontWeight="bold" fontSize="lg" textAlign="center">
                  Build Your Own
                </Text>
              </Flex>
            </GridItem>
          </SimpleGrid>
        </Container>

        {/* BOTTOM CTA BANNER */}
        <Box bg="bg.subtle" py={24} borderTopWidth="1px">
          <Container maxW="4xl" px={8} textAlign="center">
            <Flex direction="column" align="center" gap={8}>
              <Heading
                fontSize={{ base: '3xl', md: '5xl' }}
                fontWeight="extrabold"
                letterSpacing="tight"
                lineHeight="1.2"
              >
                Ready to secure your digital footprint?
              </Heading>
              <Text color="fg.muted" fontSize="xl" maxW="2xl">
                Create your account in seconds. Take full control of your private encryption keys today.
              </Text>
              <Button asChild colorPalette="yellow" size="xl" variant="solid" mt={4} px={10}>
                <Link href={user ? '/locker' : '/auth/sign-up'}>
                  Create Your Vault Now <TbArrowRight />
                </Link>
              </Button>
            </Flex>
          </Container>
        </Box>
      </Box>
    </>
  );
}
