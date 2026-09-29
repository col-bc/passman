'use client';

import { toaster } from '@/components/ui/toaster';
import { camelCaseToTitleCase } from '@/lib/util/formats';
import { templateIcon } from '@/lib/util/itemTemplates';
import { handleUpdateVaultItem } from '@/lib/vault/vaultActions';
import { DecryptedVaultItem } from '@/types/client';
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
  selectedItemIds,
  toggleSelectItem,
  hasSecurityIssues,
}: {
  vaultItem: DecryptedVaultItem;
  vaultId: string;
  selectedItemIds?: string[];
  toggleSelectItem?: (itemId: string) => void;
  hasSecurityIssues: (item: DecryptedVaultItem) => boolean;
}) {
  const [showDeleteItemDialog, setShowDeleteItemDialog] = React.useState(false);

  const handleFavoriteToggle = async (item: DecryptedVaultItem) => {
    const status = await handleUpdateVaultItem(vaultId, item.itemId, {
      isFavorite: !item.item.isFavorite,
    });
    const newStatus = !item.item.isFavorite;
    if (status.success) {
      toaster.success({
        title: newStatus ? 'Marked as favorite' : 'Unmarked as favorite',
      });
    } else {
      toaster.error({
        title: 'Failed to update favorite status',
      });
    }
  };

  return (
    <List.Item
      _hover={{ bg: selectedItemIds?.includes(vaultItem.itemId) ? 'yellow.subtle' : 'bg.muted' }}
      bg={selectedItemIds?.includes(vaultItem.itemId) ? 'yellow.subtle' : 'transparent'}
      _first={{ roundedTop: 'md' }}
      _last={{ roundedBottom: 'md' }}
      transition="all 0.2s ease-in-out"
      display="flex"
      alignItems="center"
    >
      {toggleSelectItem && (
        <Checkbox.Root
          ml={4}
          colorPalette="yellow"
          defaultChecked={false}
          onCheckedChange={() => toggleSelectItem(vaultItem.itemId)}
          checked={selectedItemIds?.includes(vaultItem.itemId)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Label srOnly>Bulk select</Checkbox.Label>
          <Checkbox.Control />
        </Checkbox.Root>
      )}
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
            <Avatar.Fallback fontSize="2xl">{templateIcon(vaultItem?.item.category || 'default')}</Avatar.Fallback>
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
            <NextLink href={`/vaults/${vaultId}/${vaultItem.itemId}`} style={{ textDecoration: 'none' }} />
          </LinkOverlay>

          {hasSecurityIssues(vaultItem) && (
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
              <Menu.Item value="favorite" onSelect={() => handleFavoriteToggle(vaultItem)}>
                {vaultItem.item.isFavorite ? (
                  <>
                    <TbStarFilled />
                    Unfavorite
                  </>
                ) : (
                  <>
                    <TbStarFilled />
                    Favorite
                  </>
                )}
              </Menu.Item>
              <Menu.Item value="edit" asChild>
                <NextLink href={`/vaults/${vaultId}/${vaultItem.itemId}?mode=edit`}>
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
