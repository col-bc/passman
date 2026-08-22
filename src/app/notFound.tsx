import NotFoundIllustration from '@/assets/tabler-illustrations/svg/dark/not-found.svg';
import Navbar from '@/components/navbar';
import { Badge, Box, Button, Container, Flex, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { TbHome, TbLogin2 } from 'react-icons/tb';

export default function NotFound() {
  return (
    <Flex direction="column" h="full" minH="100vh" bg="bg">
      <Navbar user={null} />
      <Container maxW="5xl" py={10} px={8} flex={1}>
        <Flex
          gap={4}
          direction={{ base: 'column-reverse', lg: 'row' }}
          align="center"
          justify="center"
          id="notfound-content"
        >
          <Box flex={1}>
            <Badge colorPalette="red" mb={4} size="lg">
              ERROR 404
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
              Not Found
            </Heading>

            <Text fontSize="lg" mb={8} lineHeight="taller">
              The page you are looking for could not be found. It may have been moved or deleted.
            </Text>

            <Flex gap={4}>
              <Button colorPalette="yellow" variant="subtle" size="lg" onClick={() => window.history.back()}>
                <TbLogin2 />
                Go Back
              </Button>
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
              <NotFoundIllustration
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
