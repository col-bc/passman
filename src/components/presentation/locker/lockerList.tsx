'use client';

import CreateLockerDialog from '@/components/forms/locker/createLocker';
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
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  LinkBox,
  LinkOverlay,
  List,
  Menu,
  SimpleGrid,
  Stat,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import {
  TbArrowBarUp,
  TbDotsVertical,
  TbGaugeFilled,
  TbLayoutListFilled,
  TbPencil,
  TbPlus,
  TbShare,
  TbShieldFilled,
  TbStack3Filled,
  TbTrash,
} from 'react-icons/tb';
import DeleteLockerDialog from './deleteLockerDialog';

export default function LockerList({ encryptedLockers, user }: { encryptedLockers: EncryptedLocker[]; user: User }) {
  const { handleUnlock, lockers, mek } = useLocker();

  React.useEffect(() => {
    if (mek && encryptedLockers.length > 0 && lockers.length === 0) {
      handleUnlock(encryptedLockers).catch(console.error);
    }
  }, [mek, encryptedLockers, lockers.length, handleUnlock]);

  const aggregateStats = React.useMemo(() => {
    const itemCount = lockers.reduce((acc, locker) => acc + locker.lockerItems.length, 0);
    const fieldCount = lockers.reduce((acc, locker) => {
      const fieldsInLocker = locker.lockerItems.reduce((itemAcc, lockerItem) => {
        const itemFields = lockerItem.item.decryptedData ? Object.keys(lockerItem.item.decryptedData).length : 0;
        return itemAcc + itemFields;
      }, 0);
      return acc + fieldsInLocker;
    }, 0);
    return { itemCount, fieldCount };
  }, [lockers]);

  return (
    <Flex direction="column" as="section" gap={10}>
      <Card.Root variant="elevated" border="none" shadow="sm" rounded="md">
        <Card.Header>
          <Flex direction="row" gap={4}>
            <Heading as="h1" fontSize="3xl" fontWeight="extrabold" letterSpacing="tight" whiteSpace="nowrap" flex={1}>
              Your Lockers
            </Heading>

            <CreateLockerDialog>
              <Button colorPalette="yellow" ml="auto">
                <TbPlus />
                Create New Locker
              </Button>
            </CreateLockerDialog>
          </Flex>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 2, lg: 4 }} gap={6}>
            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Item Count</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbStack3Filled />
                </Icon>
              </HStack>
              <Stat.ValueText>{aggregateStats.itemCount}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Total Fields</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbLayoutListFilled />
                </Icon>
              </HStack>
              <Stat.ValueText>{aggregateStats.fieldCount}</Stat.ValueText>
            </Stat.Root>
            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Security Score</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbGaugeFilled />
                </Icon>
              </HStack>
              <Stat.ValueText>??</Stat.ValueText>
            </Stat.Root>

            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Security Risks</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbShieldFilled />
                </Icon>
              </HStack>
              <Stat.ValueText></Stat.ValueText>
            </Stat.Root>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      <List.Root listStyleType="none" gap={4}>
        {lockers
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map((decryptedLocker) => (
            <ListItem key={decryptedLocker.id} locker={decryptedLocker} />
          ))}
      </List.Root>
    </Flex>
  );
}

function ListItem({ locker }: { locker: DecryptedLocker }) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  return (
    <>
      <List.Item
        as="div"
        key={`locker-${locker.id}`}
        bg="bg.panel"
        shadow="sm"
        _hover={{
          zIndex: 11,
          bg: 'bg.muted/50',
          scale: 1.01,
          shadow: 'md',
        }}
        transition="all 0.2s ease-in-out"
        rounded="sm"
        display="flex"
        alignItems="center"
        gap={4}
      >
        <LinkBox w="full" asChild p={4}>
          <Flex direction="row" align="center" width="full" gap={4}>
            <Avatar.Root size="md" rounded="sm" bg="yellow.muted" color="yellow.fg">
              <Avatar.Fallback>{locker.title?.[0] ?? locker.id?.[0]}</Avatar.Fallback>
            </Avatar.Root>

            <Flex direction="column" align="start" justify="start" flex={1}>
              <Heading fontSize="lg" fontWeight="medium" lineHeight="short" letterSpacing="tighter" flex={1}>
                {locker.title}
              </Heading>
              <Text fontSize="xs" color="fg.muted">
                {timeSinceDate(new Date(locker.updatedAt))}
              </Text>
            </Flex>

            <LinkOverlay asChild>
              <Link href={`/locker/${locker.id}`} style={{ textDecoration: 'none' }} />
            </LinkOverlay>

            <Text fontSize="sm" color="fg.muted"></Text>
            <Badge colorPalette="yellow" variant="subtle">
              {locker.lockerItems?.length}
              {locker.lockerItems?.length === 1 ? ' ITEM' : ' ITEMS'}
            </Badge>

            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton
                  aria-label="Locker item options"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TbDotsVertical />
                </IconButton>
              </Menu.Trigger>
              <Menu.Positioner zIndex={999}>
                <Menu.Content w={48}>
                  <Menu.Item value="edit">
                    <TbPencil />
                    Edit
                  </Menu.Item>
                  <Menu.Item value="share">
                    <TbShare />
                    Share
                  </Menu.Item>
                  <Menu.Item value="move">
                    <TbArrowBarUp />
                    Move Lockers
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item
                    value="delete"
                    color="red.fg"
                    _hover={{ bg: 'red.subtle' }}
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <TbTrash />
                    Delete
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </Flex>
        </LinkBox>
      </List.Item>
      <DeleteLockerDialog
        lockerId={locker.id!}
        open={showDeleteDialog}
        onOpenChange={(details) => setShowDeleteDialog(details.open)}
      />
    </>
  );
}
