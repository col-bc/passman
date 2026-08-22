'use client';
import ScreenValue from '@/components/ui/screenValue';
import { useLocker } from '@/hooks/use-locker';
import { RepeatedPassword } from '@/types/client';
import { Badge, Button, EmptyState, Link, Table, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { TbArrowRight, TbShieldCheckFilled } from 'react-icons/tb';
import FixIssueDialog from './fixIssueDialog';

export default function RepeatedPasswordsTable({ repeatedPasswords }: { repeatedPasswords: RepeatedPassword[] }) {
  const { lockers } = useLocker();
  return (
    <Table.ScrollArea borderWidth="1px" w="full" borderRadius="sm" borderColor="border" shadow="sm">
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader fontWeight="semibold">Locker</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Item</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Label</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Value</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {repeatedPasswords.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5} textAlign="center" py={4}>
                <EmptyState.Root>
                  <EmptyState.Indicator>
                    <TbShieldCheckFilled size={32} />
                  </EmptyState.Indicator>
                  <EmptyState.Title>No Repeated Passwords Found</EmptyState.Title>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : null}
          {repeatedPasswords.map((rp) => {
            const firstOccurrence = rp.occurrences[0];

            return (
              <Table.Row key={rp.password}>
                <Table.Cell>
                  {firstOccurrence.lockerName}
                  {rp.count > 1 && (
                    <Text as="span" fontSize="xs" color="fg.muted" ml={2}>
                      (+{rp.count - 1} other)
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Link
                    as={NextLink}
                    href={`/locker/${firstOccurrence.lockerId}/item/${firstOccurrence.itemId}`}
                    colorPalette="yellow"
                  >
                    {firstOccurrence.itemName}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette="red" variant="subtle" rounded="full">
                    {rp.count} Uses
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <ScreenValue>{rp.password}</ScreenValue>
                </Table.Cell>
                <Table.Cell>
                  <FixIssueDialog
                    href={`/locker/${firstOccurrence.lockerId}/item/${firstOccurrence.itemId}?mode=edit&highlightIndex=${firstOccurrence.fieldIndex}`}
                    descriptionChildren={<RepeatedPasswordDialogContent repeatedPassword={rp} />}
                  >
                    <Button size="xs" variant="subtle" colorPalette="yellow">
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

function RepeatedPasswordDialogContent({ repeatedPassword: rp }: { repeatedPassword: RepeatedPassword }) {
  return (
    <>
      <Text mb={4}>
        The password <ScreenValue display="inline">{rp.password}</ScreenValue> is used in multiple accounts. This can be
        a security risk, as using the same password for multiple accounts can make it easier for attackers to compromise
        your accounts.
      </Text>
      <Text>
        This is a security risk, as using the same password for multiple accounts can make it easier for attackers to
        compromise your accounts. We recommend that you change this password to a unique and strong one for each
        account. You can do this easily using the password generator.
      </Text>
    </>
  );
}
