'use client';

import { VaultIconMap } from '@/components/forms/vault/iconPicker';
import { SecurityMonitoringDialog } from '@/components/forms/vault/securityScanDialog';
import { VaultFormDialog } from '@/components/forms/vault/vaultForm';
import { useSecurityAnalytics } from '@/hooks/use-security-analytics';
import { useVaults } from '@/hooks/use-vaults';
import { camelCaseToTitleCase } from '@/lib/util/formats';
import { templateIcon } from '@/lib/util/itemTemplates';
import { DecryptedVaultItem } from '@/types/client';
import { VaultWithItems } from '@/types/server';
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
  Link,
  LinkBox,
  LinkOverlay,
  List,
  Menu,
  SimpleGrid,
  Stat,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import {
  TbAlertTriangle,
  TbArrowBarUp,
  TbDotsVertical,
  TbDownload,
  TbEdit,
  TbFilter,
  TbGaugeFilled,
  TbLayoutListFilled,
  TbListDetails,
  TbLockSquareRounded,
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
import DeleteVaultDialog from './deleteDialog';
import DeleteVaultItemDialog from './deleteVaultItemDialog';

export default function VaultItemList({
  vaultId,
  encryptedVaults,
}: {
  vaultId: string;
  encryptedVaults: VaultWithItems[];
}) {
  const searchParams = useSearchParams();
  const { currentVault, setCurrentVault, handleUnlock, mek, vaults } = useVaults();
  const router = useRouter();
  const { hasSecurityIssues } = useSecurityAnalytics(vaults);

  const [enableBulk, setEnableBulk] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = React.useState<string>('date-desc');

  const [showRenameDialog, setShowRenameDialog] = React.useState(false);
  const [showDeleteItemDialog, setShowDeleteItemDialog] = React.useState(false);
  const [showSecurityScanDialog, setShowSecurityScanDialog] = React.useState(
    searchParams.get('showMonitoring') === 'true' || false,
  );
  const [showDeleteVaultDialog, setShowDeleteVaultDialog] = React.useState(false);

  const aggregatedFields = React.useMemo(() => {
    if (!currentVault) return [];
    const fields: { [key: string]: number } = {};
    currentVault.vaultItems.forEach((vault) => {
      Object.keys(vault.item.decryptedData || {}).forEach((key) => {
        fields[key] = (fields[key] || 0) + 1;
      });
    });
    return fields;
  }, [currentVault]);

  const [securityScore, setSecurityScore] = React.useState<number>(0);

  React.useEffect(() => {
    if (!currentVault) return;
    const totalItems = currentVault.vaultItems.length;
    const insecureItems = currentVault.vaultItems.filter((item) => hasSecurityIssues(item)).length;
    const handleEffect = () =>
      setSecurityScore(totalItems === 0 ? 0 : ((totalItems - insecureItems) / totalItems) * 100);
    handleEffect();
  }, [currentVault, hasSecurityIssues]);

  /**
   * If the MEK is available and there are encrypted vaults but no decrypted vaults,
   * attempt to unlock the vaults with the `handleUnlock` function.
   */
  React.useEffect(() => {
    if (!mek || encryptedVaults.length === 0) return;
    const encryptedItemCount = encryptedVaults.reduce((acc, v) => acc + v.vaultItems.length, 0);
    const decryptedItemCount = vaults.reduce((acc, v) => acc + v.vaultItems.length, 0);
    // If we have zero decrypted vault items loaded OR the server count doesn't match our in-memory count, decrypt!
    if (vaults.length === 0 || encryptedItemCount !== decryptedItemCount) {
      handleUnlock(encryptedVaults).catch(console.error);
    }
  }, [mek, encryptedVaults, vaults, handleUnlock]);

  /**
   * When the vaults or vaultId change, find the vault with the matching ID and set it as the current vault.
   * If no matching vault is found, log a warning to the console.
   */
  React.useEffect(() => {
    if (vaults.length > 0) {
      const vault = vaults.find((l) => l.id === vaultId);
      if (vault && vault.id !== currentVault?.id) {
        setCurrentVault(vault);
      }
      if (!vault) {
        console.warn(`Vault with ID ${vaultId} not found in decrypted vaults.`);
      }
    }
  }, [vaults, vaultId, currentVault?.id, setCurrentVault]);

  const openVaultItem = (item: DecryptedVaultItem) => {
    router.push(`/vaults/${currentVault?.id}/${item.itemId}`);
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
    if (!currentVault) return;
    if (selectedItems.size === currentVault.vaultItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentVault.vaultItems.map((item) => item.itemId)));
    }
  };

  const sortedVaultItems = React.useMemo(() => {
    if (!currentVault) return [];
    const items = [...currentVault.vaultItems];
    switch (sortOrder) {
      case 'date-desc':
        return items.sort((a, b) => b.item.createdAt.getTime() - a.item.createdAt.getTime());
      case 'date-asc':
        return items.sort((a, b) => a.item.createdAt.getTime() - b.item.createdAt.getTime());
      case 'name-asc':
        return items.sort((a, b) => a.item.title.localeCompare(b.item.title));
      case 'name-desc':
        return items.sort((a, b) => b.item.title.localeCompare(a.item.title));
      case 'category-asc':
        return items.sort((a, b) => a.item.category.localeCompare(b.item.category));
      case 'category-desc':
        return items.sort((a, b) => b.item.category.localeCompare(a.item.category));
      default:
        return items;
    }
  }, [currentVault, sortOrder]);

  const handleMonitoringDialogClose = (event: { open: boolean }) => {
    if (!event.open) {
      setShowSecurityScanDialog(false);
      router.replace(`/vaults/${currentVault?.id}`);
    }
  };

  if (!currentVault) {
    return <div>Loading vault details...</div>;
  }

  const monitoringEnabled = currentVault.enableMonitoring;

  return (
    <Flex direction="column" as="section" gap={10}>
      <Card.Root variant="elevated">
        <Card.Header>
          <Flex direction={{ base: 'column', lg: 'row' }} gap={4}>
            <Flex direction="row" align="center" gap={4}>
              <Avatar.Root size="md" rounded="sm" bg="yellow.muted" color="yellow.fg">
                <Icon as={currentVault.icon ? VaultIconMap[currentVault.icon] : TbLockSquareRounded} boxSize={8} />
              </Avatar.Root>
              <Heading as="h1" fontSize="3xl" fontWeight="extrabold" letterSpacing="tight" whiteSpace="nowrap" flex={1}>
                {currentVault.title}
              </Heading>
            </Flex>
            <Flex direction="row" gap={[2, 4]} justify={{ base: 'flex-start', md: 'flex-end' }} w="full">
              <Menu.Root>
                <Button as={Menu.Trigger} colorPalette="yellow" variant="surface">
                  <TbDotsVertical />
                  <Text as="span" display={{ base: 'none', md: 'inline' }}>
                    Options
                  </Text>
                </Button>
                <Menu.Positioner>
                  <Menu.Content w={48}>
                    <Menu.Item value="rename" onClick={() => setShowRenameDialog(true)}>
                      <TbEdit />
                      Rename Vault
                    </Menu.Item>
                    <Menu.Item value="bulk" onClick={() => setEnableBulk(!enableBulk)}>
                      <TbStack2 />
                      {enableBulk ? 'Disable Bulk' : 'Enable Bulk'}
                    </Menu.Item>
                    <Menu.Item value="share">
                      <TbShare />
                      Share Vault
                    </Menu.Item>
                    <Menu.Item value="security-scan" onClick={() => setShowSecurityScanDialog(true)}>
                      <TbShield />
                      Security Scan
                    </Menu.Item>
                    <Menu.Separator />
                    <Menu.Item value="import" onClick={() => router.push(`/vaults/${currentVault.id}/import`)}>
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
                      onClick={() => setShowDeleteVaultDialog(true)}
                    >
                      <TbTrash />
                      Delete
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
              <Link href={`/vaults/${currentVault.id}/new`}>
                <Button colorPalette="yellow" variant="solid" w="full">
                  <TbPlus />
                  Add New Item
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 2, lg: 4 }} gap={{ base: 4, lg: 6 }}>
            <Stat.Root p="4" rounded="sm" bg="bg.muted" color="fg.muted">
              <HStack justify="space-between">
                <Stat.Label>Item Count</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbStack3Filled />
                </Icon>
              </HStack>
              <Stat.ValueText>{currentVault.vaultItems.length}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root p="4" rounded="sm" bg="bg.muted" color="fg.muted">
              <HStack justify="space-between">
                <Stat.Label>Total Fields</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbLayoutListFilled />
                </Icon>
              </HStack>
              <Stat.ValueText>{Object.keys(aggregatedFields).length}</Stat.ValueText>
            </Stat.Root>
            <Stat.Root p="4" rounded="sm" bg="bg.muted" color="fg.muted">
              <HStack justify="space-between">
                <Stat.Label>Security Score</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbGaugeFilled />
                </Icon>
              </HStack>
              <Stat.ValueText>{securityScore !== null ? `${securityScore.toFixed(0)}%` : '??'}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root p="4" rounded="sm" bg="bg.muted" color="fg.muted">
              <HStack justify="space-between">
                <Stat.Label>Security Monitoring</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbShieldFilled />
                </Icon>
              </HStack>
              <Stat.ValueText>{currentVault.enableMonitoring ? 'ON' : 'OFF'}</Stat.ValueText>
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
          Vault Items
        </Heading>

        {enableBulk && (
          <Group attached>
            <Button colorPalette="gray" variant="surface" size="sm" onClick={toggleSelectAll}>
              {selectedItems.size === currentVault.vaultItems.length ? 'Deselect All' : 'Select All'}
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
        <Menu.Root>
          <IconButton as={Menu.Trigger} variant="surface" colorPalette="gray" size="sm">
            <TbFilter />
          </IconButton>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.RadioItemGroup>
                <Menu.ItemGroupLabel>Sort By</Menu.ItemGroupLabel>
                <Menu.RadioItem value="date-desc">Newest to Oldest</Menu.RadioItem>
                <Menu.RadioItem value="date-asc">Oldest to Newest</Menu.RadioItem>
                <Menu.RadioItem value="name-asc">Name A-Z</Menu.RadioItem>
                <Menu.RadioItem value="name-desc">Name Z-A</Menu.RadioItem>
                <Menu.RadioItem value="category-asc">Category A-Z</Menu.RadioItem>
                <Menu.RadioItem value="category-desc">Category Z-A</Menu.RadioItem>
              </Menu.RadioItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </Flex>

      {currentVault.vaultItems.length === 0 ? (
        <EmptyState.Root textAlign="center" border="1px dashed" borderColor="border" rounded="md">
          <VStack gap={2}>
            <EmptyState.Indicator>
              <TbListDetails size={60} color="fg.muted" />
            </EmptyState.Indicator>
            <EmptyState.Title>No Items Found</EmptyState.Title>
            <EmptyState.Description>
              This vault has no items yet. Create your first item to get started.
            </EmptyState.Description>
            <Link href={`/vaults/${currentVault.id}/new`}>
              <Button colorPalette="yellow" variant="solid" size="sm">
                Add New Item
              </Button>
            </Link>
          </VStack>
        </EmptyState.Root>
      ) : (
        <List.Root listStyleType="none" gap={3}>
          {sortedVaultItems.map((vaultItem, index) => (
            <List.Item key={`vault-item-${vaultItem.itemId}-${index}`}>
              <Card.Root variant="outline" _hover={{ bg: 'bg.muted' }} transition="all 0.2s ease-in-out">
                <LinkBox w="full" p={4}>
                  <Checkbox.Root
                    colorPalette="yellow"
                    defaultChecked={false}
                    display={enableBulk ? 'inline-block' : 'none'}
                    onCheckedChange={() => toggleSelectItem(vaultItem.itemId)}
                    checked={selectedItems.has(vaultItem.itemId)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Label srOnly>Bulk select</Checkbox.Label>
                    <Checkbox.Control />
                  </Checkbox.Root>

                  <Flex direction="row" align="center" width="full" gap={2}>
                    <Avatar.Root size="lg" rounded="sm" bg="yellow.subtle" color="yellow.fg">
                      <Avatar.Fallback fontSize="2xl">{templateIcon(vaultItem.item.category)}</Avatar.Fallback>
                    </Avatar.Root>

                    <Flex direction="column" align="start" justify="start" flex={1}>
                      <Card.Title flex={1}>{vaultItem.item.title}</Card.Title>
                      <Badge>{camelCaseToTitleCase(vaultItem.item.category)}</Badge>
                    </Flex>

                    <LinkOverlay asChild>
                      <Link
                        href={`/vaults/${currentVault.id}/${vaultItem.itemId}`}
                        style={{ textDecoration: 'none' }}
                      />
                    </LinkOverlay>

                    {monitoringEnabled && hasSecurityIssues(vaultItem) && (
                      <Badge variant="surface" colorPalette="red" size="lg">
                        <TbAlertTriangle />
                      </Badge>
                    )}

                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <IconButton
                          aria-label="Vault item options"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TbDotsVertical />
                        </IconButton>
                      </Menu.Trigger>
                      <Menu.Positioner zIndex={999}>
                        <Menu.Content w={48}>
                          <Menu.Item value="edit" onClick={() => openVaultItem(vaultItem)}>
                            <TbPencil />
                            Edit
                          </Menu.Item>
                          <Menu.Item value="share">
                            <TbShare />
                            Share
                          </Menu.Item>
                          <Menu.Item value="move">
                            <TbArrowBarUp />
                            Move Vaults
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
              </Card.Root>
              <DeleteVaultItemDialog
                vaultId={vaultId!}
                itemId={vaultItem.item.id}
                open={showDeleteItemDialog}
                onOpenChange={(details) => setShowDeleteItemDialog(!!details.open)}
              />
            </List.Item>
          ))}
        </List.Root>
      )}

      <VaultFormDialog open={showRenameDialog} setOpen={(open) => setShowRenameDialog(open)} vault={currentVault} />
      <SecurityMonitoringDialog
        vault={currentVault}
        open={showSecurityScanDialog}
        onOpenChange={handleMonitoringDialogClose}
      />
      <DeleteVaultDialog
        vaultId={currentVault.id}
        open={showDeleteVaultDialog}
        onOpenChange={(details) => setShowDeleteVaultDialog(!!details.open)}
      />
    </Flex>
  );
}
