import { Flex, Heading, Spinner } from '@chakra-ui/react';

export default function LoadingPage() {
  return (
    <Flex h="full" minH="100%" direction="column" align="center" justify="center">
      <Spinner size="xl" colorPalette="yellow" />
      <Heading size="lg" mt={4}>
        Loading...
      </Heading>
    </Flex>
  );
}
