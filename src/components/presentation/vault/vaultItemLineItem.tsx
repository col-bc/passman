'use client';

import { camelCaseToTitleCase } from '@/lib/util/formats';
import { templateIcon } from '@/lib/util/itemTemplates';
import { DecryptedVault, DecryptedVaultItem } from '@/types/client';
import { Avatar, Badge, Checkbox, Flex, Heading, IconButton, LinkBox, LinkOverlay, List, Menu } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import {
  TbAlertTriangle,
  TbArrowBarUp,
  TbDotsVertical,
  TbPencil,
  TbShare,
  TbStarFilled,
  TbTrash,
} from 'react-icons/tb';
import DeleteVaultItemDialog from './deleteVaultItemDialog';

export default function VaultItemLineItem({
  vaultItem,
  vaultId,
  index,
  sortedVaultItems,
  selectedItems,
  toggleSelectItem,
  currentVault,
  monitoringEnabled,
  hasSecurityIssues,
}: {
  vaultItem: DecryptedVaultItem;
  vaultId: string;
  index: number;
  sortedVaultItems: DecryptedVaultItem[];
  selectedItems: Set<string>;
  toggleSelectItem: (itemId: string) => void;
  currentVault: DecryptedVault;
  monitoringEnabled: boolean;
  hasSecurityIssues: (item: DecryptedVaultItem) => boolean;
}) {
  const [showDeleteItemDialog, setShowDeleteItemDialog] = React.useState(false);

  return (
    <List.Item
      _hover={{ bg: selectedItems.has(vaultItem.itemId) ? 'yellow.subtle' : 'bg.muted' }}
      bg={selectedItems.has(vaultItem.itemId) ? 'yellow.subtle' : 'transparent'}
      _first={{ roundedTop: 'md' }}
      _last={{ roundedBottom: 'md' }}
      transition="all 0.2s ease-in-out"
      borderBottom="1px solid"
      borderColor={index === sortedVaultItems.length - 1 ? 'transparent' : 'border'}
      display="flex"
      alignItems="center"
    >
      <Checkbox.Root
        ml={4}
        colorPalette="yellow"
        defaultChecked={false}
        onCheckedChange={() => toggleSelectItem(vaultItem.itemId)}
        checked={selectedItems.has(vaultItem.itemId)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Label srOnly>Bulk select</Checkbox.Label>
        <Checkbox.Control />
      </Checkbox.Root>
      <LinkBox w="full" display="flex" px={4} py={2} gap={2} alignItems="center">
        <Flex direction="row" align="center" width="full" gap={4}>
          <Avatar.Root
            size="lg"
            rounded="sm"
            variant="outline"
            border="1px solid"
            borderColor="yellow.muted"
            bg="yellow.subtle"
            color="yellow.fg"
          >
            <Avatar.Fallback fontSize="2xl">{templateIcon(vaultItem.item.category)}</Avatar.Fallback>
          </Avatar.Root>

          <Flex direction="column" align="start" justify="start" flex={1}>
            <Heading size="md" as="h3" flex={1}>
              {vaultItem.item.title}
            </Heading>
            <Badge variant="surface" size="xs">
              {camelCaseToTitleCase(vaultItem.item.category)}
            </Badge>
          </Flex>

          <LinkOverlay asChild>
            <NextLink href={`/vaults/${currentVault.id}/${vaultItem.itemId}`} style={{ textDecoration: 'none' }} />
          </LinkOverlay>

          {monitoringEnabled && hasSecurityIssues(vaultItem) && (
            <Badge variant="surface" colorPalette="red" size="lg">
              <TbAlertTriangle />
            </Badge>
          )}
          {vaultItem.item.isFavorite && (
            <Badge variant="surface" colorPalette="yellow" size="lg">
              <TbStarFilled />
            </Badge>
          )}
        </Flex>
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton aria-label="Vault item options" variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
              <TbDotsVertical />
            </IconButton>
          </Menu.Trigger>
          <Menu.Positioner zIndex={999}>
            <Menu.Content w={48}>
              <Menu.Item value="edit" asChild>
                <NextLink href={`/vaults/${currentVault.id}/${vaultItem.itemId}?mode=edit`}>
                  <TbPencil />
                  Edit
                </NextLink>
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
      </LinkBox>
      <DeleteVaultItemDialog
        vaultId={vaultId!}
        itemId={vaultItem.item.id}
        open={showDeleteItemDialog}
        onOpenChange={(details) => setShowDeleteItemDialog(!!details.open)}
      />
    </List.Item>
  );
}
