'use client';

import { Blockquote, Box, Button, Code, Container, Flex, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { TbArrowBack, TbExclamationCircle, TbHome } from 'react-icons/tb';

export default function LockerError({ text, type }: { text: string; type: string }) {
  const router = useRouter();
  return (
    <Container maxW="xl" p={6}>
      <Flex direction="column" as="section" gap={8}>
        <Flex w={16} h={16} align="center" justify="center" rounded="lg" bg="red.subtle" color="red.fg" fontSize="5xl">
          <TbExclamationCircle />
        </Flex>
        <Box>
          <Heading as="h1" size="3xl" fontFamily="heading" fontWeight="bolder" mb={2}>
            Something Went Wrong
          </Heading>
          <Code colorPalette="gray" variant="subtle" size="lg">
            {type}
          </Code>
        </Box>
        <Box fontSize="lg" color="fg.subtle" lineHeight="tall">
          <Text>
            The server encountered an error while processing your request. This could be due to a temporary issue or a
            problem with the data.
          </Text>
          <Blockquote.Root my={4}>
            <Blockquote.Content>{text}</Blockquote.Content>
            <Blockquote.Caption>Server Response</Blockquote.Caption>
          </Blockquote.Root>
          <Text>Please try again later or contact support if the issue persists.</Text>
        </Box>
        <Flex gap={4}>
          <Button variant="solid" colorPalette="yellow" onClick={() => router.push('/locker')}>
            <TbHome />
            Go to Lockers
          </Button>
          <Button variant="subtle" colorPalette="yellow" onClick={() => router.back()}>
            <TbArrowBack />
            Go Back
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
}
