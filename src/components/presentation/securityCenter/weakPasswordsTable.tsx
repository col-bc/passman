'use client';

import ScreenValue from '@/components/ui/screenValue';
import { useLocker } from '@/hooks/use-locker';
import { WeakPassword } from '@/types/client';
import { Badge, Box, Button, EmptyState, Flex, Heading, Link, Popover, Table, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { TbArrowRight, TbShieldCheckFilled } from 'react-icons/tb';
import FixIssueDialog from './fixIssueDialog';

export default function WeakPasswordsTable({ weakPasswords }: { weakPasswords: WeakPassword[] }) {
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
            <Table.ColumnHeader fontWeight="semibold">Issues</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="semibold">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {weakPasswords.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5} textAlign="center" py={4}>
                <EmptyState.Root>
                  <EmptyState.Indicator>
                    <TbShieldCheckFilled size={32} />
                  </EmptyState.Indicator>
                  <EmptyState.Title>No Weak Passwords Found</EmptyState.Title>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : null}
          {weakPasswords.map((wp) => {
            const locker = lockers.find((l) => l.id === wp.lockerId);
            const item = locker?.lockerItems.find((li) => li.item.id === wp.itemId)?.item;
            return (
              <Table.Row key={`${wp.lockerId}-${wp.itemId}-${wp.label}`}>
                <Table.Cell>{locker?.title || 'Unknown Locker'}</Table.Cell>
                <Table.Cell>
                  <Link as={NextLink} href={`/locker/${wp.lockerId}/item/${wp.itemId}`} colorPalette="yellow">
                    {item?.title || 'Unknown Item'}
                  </Link>
                </Table.Cell>
                <Table.Cell>{wp.label}</Table.Cell>
                <Table.Cell>
                  <ScreenValue>{wp.password}</ScreenValue>
                </Table.Cell>
                <Table.Cell>
                  <Popover.Root>
                    <Popover.Trigger>
                      <Badge colorPalette={wp.problems > 2 ? 'red' : 'yellow'} variant="subtle" rounded="full">
                        {wp.problems} {wp.problems === 1 ? 'Issue' : 'Issues'}
                      </Badge>
                    </Popover.Trigger>
                    <Popover.Positioner>
                      <Popover.Content>
                        <Popover.CloseTrigger />
                        <Popover.Arrow>
                          <Popover.ArrowTip />
                        </Popover.Arrow>
                        <Popover.Body>
                          {wp.warnings.length > 0 && (
                            <>
                              <Heading size="sm">Warnings</Heading>
                              <Box as="ul" pl={4} mt={1} mb={2} listStyleType="disc">
                                {wp.warnings.map((warning, index) => (
                                  <Box as="li" fontSize="xs" color="red.fg" whiteSpace="break-spaces" key={index}>
                                    {warning}
                                  </Box>
                                ))}
                              </Box>
                            </>
                          )}
                          {wp.suggestions.length > 0 && (
                            <>
                              <Heading size="sm">Suggestions</Heading>
                              <Box as="ul" pl={4} mt={1} listStyleType="disc">
                                {wp.suggestions.map((suggestion, index) => (
                                  <Box as="li" fontSize="xs" whiteSpace="break-spaces" key={index}>
                                    {suggestion}
                                  </Box>
                                ))}
                              </Box>
                            </>
                          )}
                        </Popover.Body>
                      </Popover.Content>
                    </Popover.Positioner>
                  </Popover.Root>
                </Table.Cell>
                <Table.Cell>
                  <FixIssueDialog
                    href={`/locker/${wp.lockerId}/item/${wp.itemId}?mode=edit&highlightIndex=${wp.fieldIndex}`}
                    descriptionChildren={<WeakPasswordDialogContent weakPassword={wp} />}
                  >
                    <Button
                      size="xs"
                      variant="subtle"
                      colorPalette="yellow"
                      onClick={() => console.log('Fix Issue', wp)}
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

function WeakPasswordDialogContent({ weakPassword }: { weakPassword: WeakPassword }) {
  return (
    <Flex direction="column" gap={2}>
      <Text whiteSpace="break-spaces">
        The password for the field <strong>{weakPassword.label}</strong> in item{' '}
        <strong>{weakPassword.lockerName}</strong> locker, {<strong>{weakPassword.itemName}</strong>} does not meet
        modern security standards. Strengthen your password by:
      </Text>
      <Box as="ul" pl={4} listStyleType="disc">
        {weakPassword.warnings.map((warning, index) => (
          <Box as="li" fontSize="sm" color="red.fg" whiteSpace="break-spaces" key={index}>
            {warning}{' '}
            <Badge colorPalette="red" variant="subtle" rounded="full" ml={2}>
              Critical
            </Badge>
          </Box>
        ))}
        {weakPassword.suggestions.map((suggestion, index) => (
          <Box as="li" fontSize="sm" whiteSpace="break-spaces" key={index}>
            {suggestion}
          </Box>
        ))}
      </Box>
    </Flex>
  );
}
