'use client';

import { useLocker } from '@/hooks/use-locker';
import { timeSinceDate } from '@/lib/util/formats';
import { DecryptedLockerItem } from '@/types/client';
import { EncryptedLocker } from '@/types/server';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Code,
  DataList,
  DataListItem,
  Dialog,
  Flex,
  Group,
  Heading,
  IconButton,
  LinkBox,
  LinkOverlay,
  List,
  Menu,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  TbArrowBarUp,
  TbBuildingBank,
  TbChecks,
  TbCreditCard,
  TbCube,
  TbDotsVertical,
  TbEdit,
  TbFileTypography,
  TbHash,
  TbId,
  TbPasswordUser,
  TbPencil,
  TbPlus,
  TbShare,
  TbTrash,
} from 'react-icons/tb';
import RenameLockerForm from '../forms/renameLockerForm';

export default function LockerDetails({
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

  const templateIcon = (category: string) => {
    switch (category) {
      case 'login':
        return <TbPasswordUser className="size-10" />;
      case 'secureNote':
        return <TbFileTypography className="size-10" />;
      case 'bankAccount':
        return <TbBuildingBank className="size-10" />;
      case 'creditCard':
        return <TbCreditCard className="size-10" />;
      case 'identity':
        return <TbId className="size-10" />;
      default:
        return <TbCube className="size-10" />;
    }
  };

  if (!currentLocker) {
    return <div>Loading locker details...</div>;
  }

  return (
    <Flex direction="column" as="section" gap={8}>
      <Card.Root variant="elevated" rounded="lg">
        <Card.Header>
          <Flex direction="row" align="flex-start" gap={4}>
            <Flex direction="column" align="start" justify="start" bg="bg.subtle" rounded="md" flex={1} gap={2}>
              <Card.Title as={Heading} fontSize="3xl" fontWeight="extrabold" letterSpacing="tight">
                {currentLocker.title}
              </Card.Title>
              <Card.Description fontSize="md" color="fg.muted" display="flex" alignItems="center" gap={2}>
                <Code variant="outline">
                  <TbHash />
                  {currentLocker.id}
                </Code>
              </Card.Description>
            </Flex>
            <Badge colorPalette="yellow" variant="subtle" size="lg">
              <TbShare />
              Shared
            </Badge>
          </Flex>
        </Card.Header>
        <Card.Body>
          <DataList.Root>
            <SimpleGrid columns={{ base: 2, lg: 4 }} gap={6} mb={4}>
              <DataListItem bg="bg.emphasized" rounded="md" p={4}>
                <DataList.ItemValue fontFamily="heading" fontSize="xl" fontWeight="bold">
                  {currentLocker.lockerItems.length}
                </DataList.ItemValue>
                <DataList.ItemLabel>Number of Items</DataList.ItemLabel>
              </DataListItem>
              <DataListItem bg="bg.emphasized" rounded="md" p={4}>
                <DataList.ItemValue fontFamily="heading" fontSize="xl" fontWeight="bold">
                  {Object.values(aggregatedFields).reduce((acc, count) => acc + count, 0)}
                </DataList.ItemValue>
                <DataList.ItemLabel>Total Fields</DataList.ItemLabel>
              </DataListItem>
              <DataListItem bg="bg.emphasized" rounded="md" p={4}>
                <DataList.ItemValue fontFamily="heading" fontSize="xl" fontWeight="bold">
                  {timeSinceDate(new Date(currentLocker.createdAt))}
                </DataList.ItemValue>
                <DataList.ItemLabel>Created</DataList.ItemLabel>
              </DataListItem>
              <DataListItem bg="bg.emphasized" rounded="md" p={4}>
                <DataList.ItemValue fontFamily="heading" fontSize="xl" fontWeight="bold">
                  {timeSinceDate(new Date(currentLocker.updatedAt))}
                </DataList.ItemValue>
                <DataList.ItemLabel>Last Updated</DataList.ItemLabel>
              </DataListItem>
            </SimpleGrid>
          </DataList.Root>
        </Card.Body>
        <Card.Footer>
          <Flex direction="row" gap={4} justify="space-between" w="full">
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button colorPalette="yellow" variant="outline">
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
                    <TbChecks />
                    {enableBulk ? 'Disable Bulk Actions' : 'Enable Bulk Actions'}
                  </Menu.Item>
                  <Menu.Item value="share">
                    <TbShare />
                    Share Locker
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item value="delete" color="red.fg" _hover={{ bg: 'red.subtle' }}>
                    <TbTrash />
                    Delete Locker
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
        </Card.Footer>
      </Card.Root>

      <Flex direction="row" align="center" justify="space-between">
        <Heading
          as="h2"
          size="2xl"
          fontFamily="heading"
          fontWeight="bolder"
          letterSpacing="tighter"
          textDecoration="underline"
          textDecorationColor="yellow.emphasized"
          textDecorationThickness={2}
          textUnderlineOffset={4}
        >
          Locker Items
        </Heading>

        {enableBulk && (
          <Group attached>
            <Button colorPalette="gray" variant="subtle" size="sm" onClick={toggleSelectAll}>
              {selectedItems.size === currentLocker.lockerItems.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button colorPalette="gray" variant="subtle" size="sm" onClick={() => {}}>
              Move {selectedItems.size} {selectedItems.size > 0 ? 'Items' : 'Item'}
            </Button>
            <Button colorPalette="gray" variant="subtle" size="sm" onClick={() => {}}>
              Share {selectedItems.size} {selectedItems.size > 0 ? 'Items' : 'Item'}
            </Button>
            <Button colorPalette="red" variant="subtle" size="sm" onClick={() => {}}>
              Delete {selectedItems.size} {selectedItems.size > 0 ? 'Items' : 'Item'}
            </Button>
          </Group>
        )}
      </Flex>

      {currentLocker.lockerItems.length === 0 ? (
        <Text fontSize="md" color="fg.muted">
          This locker has no items yet. Click the &quot;Add New Item&quot; button above to create one.
        </Text>
      ) : (
        <List.Root listStyleType="none">
          {currentLocker.lockerItems
            .sort((a, b) => new Date(b.item.updatedAt).getTime() - new Date(a.item.updatedAt).getTime())
            .map((lockerItem, index) => (
              <List.Item
                as="div"
                key={`locker-item-${lockerItem.itemId}-${index}`}
                p={4}
                _hover={{
                  zIndex: 11,
                  bg: 'bg.muted',
                }}
                transition="background-color 0.2s ease-in-out"
                borderBottom="1px solid"
                borderBottomColor="border"
                display="flex"
                alignItems="center"
                gap={4}
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
                  <Flex direction="row" align="center" width="full" gap={2}>
                    <Avatar.Root size="md" rounded="md" bg="bg.emphasized" color="fg.muted">
                      <Avatar.Fallback>{templateIcon(lockerItem.item.category)}</Avatar.Fallback>
                    </Avatar.Root>

                    <Flex direction="column" align="start" justify="start" flex={1}>
                      <Heading fontSize="lg" fontWeight="medium" letterSpacing="tighter" flex={1}>
                        {lockerItem.item.title}
                      </Heading>
                      <Code size="xs" variant="surface" display="flex" alignItems="center" gap={1}>
                        <TbHash />
                        {lockerItem.itemId}
                      </Code>
                    </Flex>

                    <LinkOverlay asChild>
                      <Link
                        href={`/locker/${currentLocker.id}/item/${lockerItem.itemId}`}
                        style={{ textDecoration: 'none' }}
                      />
                    </LinkOverlay>

                    <Text fontSize="sm" color="fg.muted">
                      {timeSinceDate(new Date(lockerItem.item.updatedAt))}
                    </Text>
                    <Badge colorPalette="yellow" variant="subtle">
                      {lockerItem.item.decryptedData?.length}
                      {lockerItem.item.decryptedData?.length === 1 ? ' FIELD' : ' FIELDS'}
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
                          <Menu.Item value="delete" color="red.fg" _hover={{ bg: 'red.subtle' }}>
                            <TbTrash />
                            Delete
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Menu.Root>
                  </Flex>
                </LinkBox>
              </List.Item>
            ))}
        </List.Root>
      )}
      <Dialog.Root open={showRenameDialog} onOpenChange={(e) => setShowRenameDialog(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Rename Locker</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <RenameLockerForm
                defaultTitle={currentLocker.title}
                lockerId={currentLocker.id}
                onClose={() => setShowRenameDialog(false)}
              />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  );
}
