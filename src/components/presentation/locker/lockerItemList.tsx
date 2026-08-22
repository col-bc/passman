'use client';

import RenameLockerForm from '@/components/forms/locker/renameLockerDialog';
import { useLocker } from '@/hooks/use-locker';
import { camelCaseToTitleCase, timeSinceDate } from '@/lib/util/formats';
import { templateIcon } from '@/lib/util/itemTemplates';
import { DecryptedLockerItem } from '@/types/client';
import { EncryptedLocker } from '@/types/server';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Flex,
  Group,
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
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  TbArrowBarUp,
  TbDotsVertical,
  TbDownload,
  TbEdit,
  TbGaugeFilled,
  TbLayoutListFilled,
  TbListDetails,
  TbPencil,
  TbPlus,
  TbShare,
  TbShield,
  TbShieldFilled,
  TbStack2,
  TbStack3Filled,
  TbTrash,
  TbUpload,
} from 'react-icons/tb';
import SecurityScanDialog from '../securityScanDialog';
import DeleteLockerDialog from './deleteLockerDialog';
import DeleteLockerItemDialog from './deleteLockerItemDialog';

export default function LockerItemList({
  lockerId,
  encryptedLockers,
}: {
  lockerId: string;
  encryptedLockers: EncryptedLocker[];
}) {
  const { lockers, currentLocker, setCurrentLocker, handleUnlock, mek } = useLocker();
  const router = useRouter();

  const [enableBulk, setEnableBulk] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  const [showRenameDialog, setShowRenameDialog] = React.useState(false);
  const [showDeleteItemDialog, setShowDeleteItemDialog] = React.useState(false);
  const [showSecurityScanDialog, setShowSecurityScanDialog] = React.useState(false);
  const [showDeleteLockerDialog, setShowDeleteLockerDialog] = React.useState(false);

  const aggregatedFields = React.useMemo(() => {
    if (!currentLocker) return [];
    const fields: { [key: string]: number } = {};
    currentLocker.lockerItems.forEach((item) => {
      Object.keys(item.item.decryptedData || {}).forEach((key) => {
        fields[key] = (fields[key] || 0) + 1;
      });
    });
    return fields;
  }, [currentLocker]);

  /**
   * If the MEK is available and there are encrypted lockers but no decrypted lockers,
   * attempt to unlock the lockers with the `handleUnlock` function.
   */
  React.useEffect(() => {
    if (!mek || encryptedLockers.length === 0) return;
    const encryptedItemCount = encryptedLockers.reduce((acc, l) => acc + l.lockerItems.length, 0);
    const decryptedItemCount = lockers.reduce((acc, l) => acc + l.lockerItems.length, 0);
    // If we have zero lockers loaded OR the server count doesn't match our in-memory count, decrypt!
    if (lockers.length === 0 || encryptedItemCount !== decryptedItemCount) {
      handleUnlock(encryptedLockers).catch(console.error);
    }
  }, [mek, encryptedLockers, lockers, handleUnlock]);

  /**
   * When the lockers or lockerId change, find the locker with the matching ID and set it as the current locker.
   * If no matching locker is found, log a warning to the console.
   */
  React.useEffect(() => {
    if (lockers.length > 0) {
      const locker = lockers.find((l) => l.id === lockerId);
      if (locker && locker.id !== currentLocker?.id) {
        setCurrentLocker(locker);
      }
      if (!locker) {
        console.warn(`Locker with ID ${lockerId} not found in decrypted lockers.`);
      }
    }
  }, [lockers, lockerId, currentLocker?.id, setCurrentLocker]);

  const openLockerItem = (item: DecryptedLockerItem) => {
    router.push(`/locker/${currentLocker?.id}/item/${item.itemId}`);
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    if (!currentLocker) return;
    if (selectedItems.size === currentLocker.lockerItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentLocker.lockerItems.map((item) => item.itemId)));
    }
  };

  if (!currentLocker) {
    return <div>Loading locker details...</div>;
  }

  return (
    <Flex direction="column" as="section" gap={10}>
      <Card.Root variant="elevated" border="none" shadow="sm" rounded="md">
        <Card.Header>
          <Flex direction="row" gap={4}>
            <Heading as="h1" fontSize="3xl" fontWeight="extrabold" letterSpacing="tight" whiteSpace="nowrap" flex={1}>
              {currentLocker.title}
            </Heading>
            <Flex direction="row" gap={4} shrink={1} justify="flex-end" w="full">
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button colorPalette="yellow" variant="surface">
                    <TbDotsVertical /> Options
                  </Button>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content w={48}>
                    <Menu.Item value="rename" onClick={() => setShowRenameDialog(true)}>
                      <TbEdit />
                      Rename Locker
                    </Menu.Item>
                    <Menu.Item value="bulk" onClick={() => setEnableBulk(!enableBulk)}>
                      <TbStack2 />
                      {enableBulk ? 'Disable Bulk' : 'Enable Bulk'}
                    </Menu.Item>
                    <Menu.Item value="share">
                      <TbShare />
                      Share Locker
                    </Menu.Item>
                    <Menu.Item value="security-scan" onClick={() => setShowSecurityScanDialog(true)}>
                      <TbShield />
                      Security Scan
                    </Menu.Item>
                    <Menu.Separator />
                    <Menu.Item value="import" onClick={() => router.push(`/locker/${currentLocker.id}/import`)}>
                      <TbUpload />
                      Import Items
                    </Menu.Item>
                    <Menu.Item value="export">
                      <TbDownload />
                      Export Items
                    </Menu.Item>
                    <Menu.Separator />
                    <Menu.Item
                      value="delete"
                      color="red.fg"
                      _hover={{ bg: 'red.subtle' }}
                      onClick={() => setShowDeleteLockerDialog(true)}
                    >
                      <TbTrash />
                      Delete
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
              <Link href={`/locker/${currentLocker.id}/item/new`} passHref>
                <Button colorPalette="yellow" variant="solid">
                  <TbPlus />
                  Add New Item
                </Button>
              </Link>
            </Flex>
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
              <Stat.ValueText>{currentLocker.lockerItems.length}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Total Fields</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbLayoutListFilled />
                </Icon>
              </HStack>
              <Stat.ValueText>{Object.keys(aggregatedFields).length}</Stat.ValueText>
            </Stat.Root>
            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Security Score</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbGaugeFilled />
                </Icon>
              </HStack>
              <Stat.ValueText>80</Stat.ValueText>
            </Stat.Root>

            <Stat.Root borderWidth="1px" p="4" rounded="sm">
              <HStack justify="space-between">
                <Stat.Label>Security Scanning</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbShieldFilled />
                </Icon>
              </HStack>
              <Stat.ValueText>{currentLocker.enableMonitoring ? 'ON' : 'OFF'}</Stat.ValueText>
            </Stat.Root>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      <Flex direction="row" align="center" justify="space-between">
        <Heading
          as="h2"
          size="2xl"
          fontFamily="heading"
          fontWeight="bolder"
          letterSpacing="tighter"
          borderBottom="2px solid"
          borderColor="yellow.muted"
          pb={1}
        >
          Locker Items
        </Heading>

        {enableBulk && (
          <Group attached>
            <Button colorPalette="gray" variant="surface" size="sm" onClick={toggleSelectAll}>
              {selectedItems.size === currentLocker.lockerItems.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button colorPalette="gray" variant="surface" size="sm" onClick={() => {}}>
              Move {selectedItems.size} {selectedItems.size > 0 ? 'Items' : 'Item'}
            </Button>
            <Button colorPalette="gray" variant="surface" size="sm" onClick={() => {}}>
              Share {selectedItems.size} {selectedItems.size > 0 ? 'Items' : 'Item'}
            </Button>
            <Button colorPalette="red" variant="surface" size="sm" onClick={() => {}}>
              Delete {selectedItems.size} {selectedItems.size > 0 ? 'Items' : 'Item'}
            </Button>
          </Group>
        )}
      </Flex>

      {currentLocker.lockerItems.length === 0 ? (
        <EmptyState.Root textAlign="center" border="1px dashed" borderColor="border" rounded="md">
          <VStack gap={2}>
            <EmptyState.Indicator>
              <TbListDetails size={60} color="fg.muted" />
            </EmptyState.Indicator>
            <EmptyState.Title>No Items Found</EmptyState.Title>
            <EmptyState.Description>
              This locker has no items yet. Create your first item to get started.
            </EmptyState.Description>
            <Link href={`/locker/${currentLocker.id}/item/new`} passHref>
              <Button colorPalette="yellow" variant="solid" size="sm">
                Add New Item
              </Button>
            </Link>
          </VStack>
        </EmptyState.Root>
      ) : (
        <List.Root listStyleType="none" gap={3}>
          {currentLocker.lockerItems
            .sort((a, b) => new Date(b.item.updatedAt).getTime() - new Date(a.item.updatedAt).getTime())
            .map((lockerItem, index) => (
              <List.Item
                as="div"
                role="group"
                key={`locker-item-${lockerItem.itemId}-${index}`}
                bg="bg.panel"
                shadow="sm"
                p={4}
                _hover={{
                  zIndex: 11,
                  scale: 1.01,
                  shadow: 'md',
                }}
                transition="all 0.2s ease-in-out"
                display="flex"
                alignItems="center"
                rounded="sm"
                gap={2}
              >
                <Checkbox.Root
                  colorPalette="yellow"
                  defaultChecked={false}
                  display={enableBulk ? 'inline-block' : 'none'}
                  onCheckedChange={() => toggleSelectItem(lockerItem.itemId)}
                  checked={selectedItems.has(lockerItem.itemId)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Label srOnly>Bulk select</Checkbox.Label>
                  <Checkbox.Control />
                </Checkbox.Root>
                <LinkBox w="full" asChild>
                  <Flex direction="row" align="center" width="full" gap={4}>
                    <Avatar.Root size="lg" rounded="sm" bg="yellow.subtle" color="yellow.fg">
                      <Avatar.Fallback fontSize="2xl">{templateIcon(lockerItem.item.category)}</Avatar.Fallback>
                    </Avatar.Root>

                    <Flex direction="column" align="start" justify="start" flex={1}>
                      <Heading fontSize="lg" fontWeight="medium" letterSpacing="tighter" lineHeight="short" flex={1}>
                        {lockerItem.item.title}
                      </Heading>
                      <Badge>{camelCaseToTitleCase(lockerItem.item.category)}</Badge>
                    </Flex>

                    <LinkOverlay asChild>
                      <Link
                        href={`/locker/${currentLocker.id}/item/${lockerItem.itemId}`}
                        style={{ textDecoration: 'none' }}
                      />
                    </LinkOverlay>

                    <Text fontSize="xs" color="fg.muted">
                      Updated {timeSinceDate(lockerItem.item.updatedAt)}
                    </Text>

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
                          <Menu.Item value="edit" onClick={() => openLockerItem(lockerItem)}>
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
                            onClick={() => setShowDeleteItemDialog(true)}
                          >
                            <TbTrash />
                            Delete
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Menu.Root>
                  </Flex>
                </LinkBox>
                <DeleteLockerItemDialog
                  lockerId={lockerId!}
                  itemId={lockerItem.item.id}
                  open={showDeleteItemDialog}
                  onOpenChange={(details) => setShowDeleteItemDialog(!!details.open)}
                />
              </List.Item>
            ))}
        </List.Root>
      )}

      <RenameLockerForm
        defaultTitle={currentLocker.title}
        lockerId={currentLocker.id}
        setOpen={setShowRenameDialog}
        open={showRenameDialog}
      />
      <SecurityScanDialog
        lockerId={currentLocker.id}
        open={showSecurityScanDialog}
        onOpenChange={(details) => setShowSecurityScanDialog(!!details.open)}
      />
      <DeleteLockerDialog
        lockerId={currentLocker.id}
        open={showDeleteLockerDialog}
        onOpenChange={(details) => setShowDeleteLockerDialog(!!details.open)}
      />
    </Flex>
  );
}
