'use client';

import { LockerFormDialog } from '@/components/forms/locker/lockerForm';
import { useLocker } from '@/hooks/use-locker';
import { timeSinceDate } from '@/lib/util/formats';
import { templateIcon } from '@/lib/util/itemTemplates';
import { User } from '@/prisma/client';
import { DecryptedLocker } from '@/types/client';
import { EncryptedLocker } from '@/types/server';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Flex,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link,
  LinkBox,
  LinkOverlay,
  Menu,
  SimpleGrid,
  Stat,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import {
  TbArrowBarUp,
  TbArrowRight,
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

export default function LockerList({ encryptedLockers }: { encryptedLockers: EncryptedLocker[]; user?: User }) {
  const [showCreateLockerDialog, setShowCreateLockerDialog] = React.useState(false);
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
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Heading as="h1" fontSize="3xl" fontWeight="extrabold" letterSpacing="tight" whiteSpace="nowrap" flex={1}>
              Your Lockers
            </Heading>

            <Button colorPalette="yellow" ml={{ base: 0, md: 'auto' }} onClick={() => setShowCreateLockerDialog(true)}>
              <TbPlus />
              Create New Locker
            </Button>
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
              <Stat.ValueText fontFamily="mono">{aggregateStats.itemCount}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Total Fields</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbLayoutListFilled />
                </Icon>
              </HStack>
              <Stat.ValueText fontFamily="mono">{aggregateStats.fieldCount}</Stat.ValueText>
            </Stat.Root>
            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Security Score</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbGaugeFilled />
                </Icon>
              </HStack>
              <Stat.ValueText fontFamily="mono">??</Stat.ValueText>
            </Stat.Root>

            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Security Risks</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbShieldFilled />
                </Icon>
              </HStack>
              <Stat.ValueText fontFamily="mono"></Stat.ValueText>
            </Stat.Root>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      <LockerFormDialog locker={null} open={showCreateLockerDialog} setOpen={setShowCreateLockerDialog} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {lockers
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map((decryptedLocker) => (
            <LockerItem key={decryptedLocker.id} locker={decryptedLocker} />
          ))}
      </SimpleGrid>
    </Flex>
  );
}

function LockerItem({ locker }: { locker: DecryptedLocker }) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const counts = React.useMemo(() => {
    const credentialCount = locker.lockerItems.reduce((acc, lockerItem) => {
      if (lockerItem.item.category === 'credentials') {
        acc += 1;
      }
      return acc;
    }, 0);
    const bankAccountCount = locker.lockerItems.reduce((acc, lockerItem) => {
      if (lockerItem.item.category === 'bankAccount') {
        acc += 1;
      }
      return acc;
    }, 0);
    const secureNoteCount = locker.lockerItems.reduce((acc, lockerItem) => {
      if (lockerItem.item.category === 'secureNote') {
        acc += 1;
      }
      return acc;
    }, 0);
    const creditCardCount = locker.lockerItems.reduce((acc, lockerItem) => {
      if (lockerItem.item.category === 'creditCard') {
        acc += 1;
      }
      return acc;
    }, 0);
    const identityCount = locker.lockerItems.reduce((acc, lockerItem) => {
      if (lockerItem.item.category === 'identity') {
        acc += 1;
      }
      return acc;
    }, 0);
    const customCount = locker.lockerItems.reduce((acc, lockerItem) => {
      if (lockerItem.item.category === 'custom') {
        acc += 1;
      }
      return acc;
    }, 0);

    const isEmpty =
      credentialCount === 0 &&
      bankAccountCount === 0 &&
      secureNoteCount === 0 &&
      creditCardCount === 0 &&
      identityCount === 0 &&
      customCount === 0;

    const totalCount =
      credentialCount + bankAccountCount + secureNoteCount + creditCardCount + identityCount + customCount;

    return {
      credentialCount,
      bankAccountCount,
      secureNoteCount,
      creditCardCount,
      identityCount,
      customCount,
      isEmpty,
      totalCount,
    };
  }, [locker.lockerItems]);

  return (
    <>
      <GridItem
        as="div"
        key={`locker-${locker.id}`}
        bg="bg.panel"
        shadow="sm"
        _hover={{
          zIndex: 11,
          scale: 1.025,
          shadow: 'md',
        }}
        transition="all 0.2s ease-in-out"
        rounded="sm"
        gap={4}
      >
        <LinkBox w="full" p={4}>
          <Flex direction="column" align="start" justify="start" flex={1} gap={4}>
            <Flex direction="row" align="flex-start" width="full" gap={4}>
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
              <Menu.Root>
                <IconButton
                  as={Menu.Trigger}
                  aria-label="Locker item options"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TbDotsVertical />
                </IconButton>
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

            <Flex direction="row" align="center" justify="start" flex={1} flexWrap="wrap" gap={2}>
              {counts.isEmpty && (
                <Text fontSize="sm" color="fg.muted">
                  This locker is empty
                </Text>
              )}
              {counts.credentialCount > 0 && (
                <Badge size="sm">
                  {templateIcon('credentials')} {counts.credentialCount} Credentials
                </Badge>
              )}
              {counts.bankAccountCount > 0 && (
                <Badge size="sm">
                  {templateIcon('bankAccount')} {counts.bankAccountCount} Bank Accounts
                </Badge>
              )}
              {counts.secureNoteCount > 0 && (
                <Badge size="sm">
                  {templateIcon('secureNote')} {counts.secureNoteCount} Secure Notes
                </Badge>
              )}
              {counts.creditCardCount > 0 && (
                <Badge size="sm">
                  {templateIcon('creditCard')} {counts.creditCardCount} Credit Cards
                </Badge>
              )}
              {counts.identityCount > 0 && (
                <Badge size="sm">
                  {templateIcon('identity')} {counts.identityCount} Identities
                </Badge>
              )}
              {counts.customCount > 0 && (
                <Badge size="sm">
                  {templateIcon('custom')} {counts.customCount} Custom Items
                </Badge>
              )}
            </Flex>
            <LinkOverlay asChild>
              <Link as={NextLink} href={`/locker/${locker.id}`} colorPalette="yellow">
                Open Locker <TbArrowRight />
              </Link>
            </LinkOverlay>
          </Flex>
        </LinkBox>
      </GridItem>

      <DeleteLockerDialog
        lockerId={locker.id!}
        open={showDeleteDialog}
        onOpenChange={(details) => setShowDeleteDialog(details.open)}
      />
    </>
  );
}
