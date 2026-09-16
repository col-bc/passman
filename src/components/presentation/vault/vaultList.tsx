'use client';

import { VaultIconMap } from '@/components/forms/vault/iconPicker';
import { VaultFormDialog } from '@/components/forms/vault/vaultForm';
import { useVaults } from '@/hooks/use-vaults';
import { timeSinceDate } from '@/lib/util/formats';
import { templateIcon } from '@/lib/util/itemTemplates';
import { User } from '@/prisma/client';
import { DecryptedVault } from '@/types/client';
import { VaultWithItems } from '@/types/server';
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
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import {
  TbArrowBarUp,
  TbArrowRight,
  TbCirclePlus,
  TbDotsVertical,
  TbGaugeFilled,
  TbLayoutListFilled,
  TbLockSquareRounded,
  TbPencil,
  TbPlus,
  TbShare,
  TbShieldFilled,
  TbStack3Filled,
  TbTrash,
} from 'react-icons/tb';
import DeleteVaultDialog from './deleteDialog';

export default function VaultList({ v }: { v: VaultWithItems[]; user?: User }) {
  const [showCreateVaultDialog, setShowCreateVaultDialog] = React.useState(false);
  const { handleUnlock, vaults, mek } = useVaults();

  React.useEffect(() => {
    if (mek && v.length > 0 && vaults.length === 0) {
      handleUnlock(v).catch(console.error);
    }
  }, [mek, v, vaults.length, handleUnlock]);

  const aggregateStats = React.useMemo(() => {
    const itemCount = vaults.reduce((acc, vault) => acc + vault.vaultItems.length, 0);
    const fieldCount = vaults.reduce((acc, vault) => {
      const fieldsInVault = vault.vaultItems.reduce((itemAcc, vaultItem) => {
        const itemFields = vaultItem.item.decryptedData ? Object.keys(vaultItem.item.decryptedData).length : 0;
        return itemAcc + itemFields;
      }, 0);
      return acc + fieldsInVault;
    }, 0);
    return { itemCount, fieldCount };
  }, [vaults]);

  return (
    <Flex direction="column" as="section" gap={10}>
      <Card.Root variant="elevated" rounded="md">
        <Card.Header>
          <Flex direction={{ base: 'column', lg: 'row' }} gap={4}>
            <Heading as="h1" fontSize="3xl" fontWeight="extrabold" letterSpacing="tight" whiteSpace="nowrap" flex={1}>
              Your Vaults
            </Heading>

            <Button colorPalette="yellow" ml={{ base: 0, lg: 'auto' }} onClick={() => setShowCreateVaultDialog(true)}>
              <TbPlus />
              Create Vault
            </Button>
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
              <Stat.ValueText fontFamily="mono">{aggregateStats.itemCount}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root p="4" rounded="sm" bg="bg.muted" color="fg.muted">
              <HStack justify="space-between">
                <Stat.Label>Total Fields</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbLayoutListFilled />
                </Icon>
              </HStack>
              <Stat.ValueText fontFamily="mono">{aggregateStats.fieldCount}</Stat.ValueText>
            </Stat.Root>
            <Stat.Root p="4" rounded="sm" bg="bg.muted" color="fg.muted">
              <HStack justify="space-between">
                <Stat.Label>Security Score</Stat.Label>
                <Icon color="fg.muted" fontSize="xl">
                  <TbGaugeFilled />
                </Icon>
              </HStack>
              <Stat.ValueText fontFamily="mono">??</Stat.ValueText>
            </Stat.Root>

            <Stat.Root p="4" rounded="sm" bg="bg.muted" color="fg.muted">
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

      <VaultFormDialog vault={null} open={showCreateVaultDialog} setOpen={setShowCreateVaultDialog} />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {vaults
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map((decryptedVaults) => (
            <VaultItem key={decryptedVaults.id} vault={decryptedVaults} />
          ))}
        <Button
          variant="outline"
          h="full"
          minH={24}
          colorPalette="yellow"
          onClick={() => setShowCreateVaultDialog(true)}
          borderStyle="dashed"
        >
          <VStack justify="center" align="center" h="full" w="full">
            <TbCirclePlus size={24} />
            <Text>Create Vault</Text>
          </VStack>
        </Button>
      </SimpleGrid>
    </Flex>
  );
}

function VaultItem({ vault }: { vault: DecryptedVault }) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const counts = React.useMemo(() => {
    const credentialCount = vault.vaultItems.reduce((acc, vaultItem) => {
      if (vaultItem.item.category === 'credentials') {
        acc += 1;
      }
      return acc;
    }, 0);
    const bankAccountCount = vault.vaultItems.reduce((acc, vaultItem) => {
      if (vaultItem.item.category === 'bankAccount') {
        acc += 1;
      }
      return acc;
    }, 0);
    const secureNoteCount = vault.vaultItems.reduce((acc, vaultItem) => {
      if (vaultItem.item.category === 'secureNote') {
        acc += 1;
      }
      return acc;
    }, 0);
    const creditCardCount = vault.vaultItems.reduce((acc, vaultItem) => {
      if (vaultItem.item.category === 'creditCard') {
        acc += 1;
      }
      return acc;
    }, 0);
    const identityCount = vault.vaultItems.reduce((acc, vaultItem) => {
      if (vaultItem.item.category === 'identity') {
        acc += 1;
      }
      return acc;
    }, 0);
    const customCount = vault.vaultItems.reduce((acc, vaultItem) => {
      if (vaultItem.item.category === 'custom') {
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
  }, [vault.vaultItems]);

  return (
    <>
      <GridItem
        as="div"
        key={`vault-${vault.id}`}
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
                <Icon as={vault.icon ? VaultIconMap[vault.icon] : TbLockSquareRounded} boxSize={8} />
              </Avatar.Root>
              <Flex direction="column" align="start" justify="start" flex={1}>
                <Heading fontSize="lg" fontWeight="medium" lineHeight="short" letterSpacing="tighter" flex={1}>
                  {vault.title}
                </Heading>
                <Text fontSize="xs" color="fg.muted">
                  {timeSinceDate(new Date(vault.updatedAt))}
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
                  This Vault is empty
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
              <Link as={NextLink} href={`/vaults/${vault.id}`} colorPalette="yellow">
                Open Locker <TbArrowRight />
              </Link>
            </LinkOverlay>
          </Flex>
        </LinkBox>
      </GridItem>

      <DeleteVaultDialog
        vaultId={vault.id!}
        open={showDeleteDialog}
        onOpenChange={(details) => setShowDeleteDialog(details.open)}
      />
    </>
  );
}
