'use client';

import ScreenValue from '@/components/ui/screenValue';
import { useVaults } from '@/hooks/use-vaults';
import { BreachedPassword } from '@/types/client';
import { Badge, Button, EmptyState, Flex, Link, Table, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { TbArrowRight, TbShieldCheckFilled } from 'react-icons/tb';
import FixIssueDialog from './fixIssueDialog';

export default function BreachedPasswordsTable({ breachedPasswords }: { breachedPasswords: BreachedPassword[] }) {
  const { vaults } = useVaults();

  return (
    <Table.ScrollArea borderWidth="1px" w="full" borderRadius="sm" borderColor="border" shadow="sm">
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader fontWeight="semibold">Vault</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Item</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Label</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Value</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Issues</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {breachedPasswords.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5} textAlign="center" py={4}>
                <EmptyState.Root>
                  <EmptyState.Indicator>
                    <TbShieldCheckFilled size={32} />
                  </EmptyState.Indicator>
                  <EmptyState.Title>No Breached Passwords Found</EmptyState.Title>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : null}
          {breachedPasswords.map((bp) => {
            const vault = vaults.find((v) => v.id === bp.itemId);
            const item = vault?.vaultItems.find((vi) => vi.item.id === bp.itemId)?.item;
            return (
              <Table.Row key={`${bp.vaultId}-${bp.itemId}-${bp.label}`}>
                <Table.Cell>{vault?.title || 'Unknown Vault'}</Table.Cell>
                <Table.Cell>
                  <Link as={NextLink} href={`/vault/${bp.vaultId}/${bp.itemId}`} colorPalette="yellow">
                    {item?.title || 'Unknown Item'}
                  </Link>
                </Table.Cell>
                <Table.Cell>{bp.label}</Table.Cell>
                <Table.Cell>
                  <ScreenValue>{bp.password}</ScreenValue>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette="red" variant="subtle" rounded="full">
                    {bp.breachCount > 1 ? `${bp.breachCount.toLocaleString()} Breaches` : '1 Breach'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <FixIssueDialog
                    href={`/vault/${bp.vaultId}/${bp.itemId}?mode=edit&highlightIndex=${bp.fieldIndex}`}
                    descriptionChildren={<BreachedPasswordDialogContent breachedPasswords={bp} />}
                  >
                    <Button
                      size="xs"
                      variant="subtle"
                      colorPalette="yellow"
                      onClick={() => console.log('Fix Issue', bp)}
                    >
                      Resolve Issue <TbArrowRight />
                    </Button>
                  </FixIssueDialog>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}

function BreachedPasswordDialogContent({ breachedPasswords }: { breachedPasswords: BreachedPassword }) {
  return (
    <Flex direction="column" gap={2}>
      <Text whiteSpace="break-spaces">
        The account associated with this password has been found in {breachedPasswords.breachCount.toLocaleString()}{' '}
        {breachedPasswords.breachCount === 1 ? 'data breach' : 'data breaches'}. It is strongly recommended to change
        this password immediately to protect your account and personal information.
      </Text>
    </Flex>
  );
}
