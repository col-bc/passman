'use client';

import { useLocker } from '@/hooks/use-locker';
import { timeSinceDate } from '@/lib/util/formats';
import { User } from '@/prisma/client';
import { DecryptedLocker } from '@/types/client';
import { EncryptedLocker } from '@/types/server';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Code,
  createListCollection,
  Field,
  Flex,
  Heading,
  IconButton,
  LinkBox,
  LinkOverlay,
  Menu,
  Select,
  Spinner,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { TbDotsVertical, TbHash } from 'react-icons/tb';

export default function LockerList({ encryptedLockers, user }: { encryptedLockers: EncryptedLocker[]; user: User }) {
  const { loading, handleUnlock, lockers, mek } = useLocker();

  React.useEffect(() => {
    if (mek && encryptedLockers.length > 0 && lockers.length === 0) {
      handleUnlock(encryptedLockers).catch(console.error);
    }
  }, [mek, encryptedLockers, lockers.length, handleUnlock]);

  if (loading) {
    return (
      <Flex direction="column" justify="center" align="center" height="100%">
        <Spinner size="xl" />
        <Heading as="h2" size="lg">
          Decrypting your vault...
        </Heading>
      </Flex>
    );
  }

  return (
    <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="flex-start" justify="flex-start" w="full">
      <FilterComponent />
      <Flex gap={4} flex={1} w="full" direction="column">
        {lockers.map((decryptedLocker) => (
          <ListItem key={decryptedLocker.id} locker={decryptedLocker} />
        ))}
      </Flex>
    </Flex>
  );
}

function ListItem({ locker }: { locker: DecryptedLocker }) {
  return (
    <Card.Root
      w="full"
      p={4}
      transition="background-color 0.2s ease-in-out"
      borderBottom="1px solid"
      borderBottomColor="border"
      _hover={{
        zIndex: 11,
        bg: 'bg.muted',
      }}
      display="flex"
      direction="column"
      alignItems="center"
      gap={4}
    >
      <LinkBox w="full">
        <Flex direction="row" align="center" width="full" gap={2}>
          <Avatar.Root size="md" rounded="md" bg="bg.emphasized" color="fg.muted">
            <Avatar.Fallback>{locker.title.charAt(0)}</Avatar.Fallback>
          </Avatar.Root>

          <Flex direction="column" align="start" justify="start" flex={1}>
            <Heading fontSize="lg" fontWeight="medium" letterSpacing="tighter" flex={1}>
              {locker.title}
            </Heading>
            <Code size="xs" variant="surface" display="flex" alignItems="center" gap={1}>
              <TbHash />
              {locker.id}
            </Code>
          </Flex>

          <LinkOverlay asChild>
            <NextLink href={`/locker/${locker.id}`} />
          </LinkOverlay>

          <Text fontSize="x-small" color="fg.muted">
            Updated {timeSinceDate(new Date(locker.updatedAt))}
          </Text>
          <Badge fontSize="small" variant="subtle" colorPalette="yellow">
            <Text fontFamily="mono">{locker.lockerItems.length}</Text> ITEMS
          </Badge>

          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton variant="ghost" aria-label="Options" size="sm">
                <TbDotsVertical />
              </IconButton>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content w={48}>
                <Menu.Item onSelect={() => {}} value="sharing">
                  Manage Sharing
                </Menu.Item>
                <Menu.Item
                  onSelect={() => {}}
                  value="delete"
                  _hover={{ bg: 'red.subtle', color: 'red.fg' }}
                  transition="background-color 0.2s ease-in-out"
                >
                  Delete Locker
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Flex>
      </LinkBox>
    </Card.Root>
  );
}

function FilterComponent() {
  const sortOptions = createListCollection({
    items: [
      { value: 'title', label: 'Title' },
      { value: 'createdAt', label: 'Created At' },
      { value: 'updatedAt', label: 'Updated At' },
      { value: 'Category', label: 'Category' },
    ],
  });

  return (
    <Card.Root
      w="full"
      maxW={{
        base: 'full',
        md: '2xs',
      }}
    >
      <Card.Header>
        <Card.Title>Filter Content</Card.Title>
      </Card.Header>
      <Card.Body>
        <Field.Root>
          <Field.Label>Sort By</Field.Label>
          <Select.Root collection={sortOptions} size="sm">
            <Select.Trigger>
              <Select.ValueText placeholder="Select an option" />
            </Select.Trigger>
            <Select.Positioner>
              <Select.Content>
                {sortOptions.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label>Filter By Category</Field.Label>
          <Select.Root collection={sortOptions} size="sm">
            <Select.Trigger>
              <Select.ValueText placeholder="Select an option" />
            </Select.Trigger>
            <Select.Positioner>
              <Select.Content>
                {sortOptions.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>
      </Card.Body>
      <Card.Footer>
        <Button variant="subtle" colorPalette="yellow" size="sm" onClick={() => {}}>
          Apply Filters
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
