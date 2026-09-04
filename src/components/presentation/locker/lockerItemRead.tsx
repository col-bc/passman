import ScreenValue from '@/components/ui/screenValue';
import { toaster } from '@/components/ui/toaster';
import { camelCaseToTitleCase } from '@/lib/util/formats';
import { DecryptedLockerItem, ItemContent } from '@/types/client';
import { Badge, Box, DataList, Flex, Heading, Separator } from '@chakra-ui/react';
import React from 'react';
import { TbLock, TbRosetteDiscountCheck } from 'react-icons/tb';

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toaster.success({
        title: 'Copied to clipboard',
        description: 'The value has been copied to your clipboard.',
        duration: 2000,
        closable: true,
      });
    })
    .catch((err) => {
      console.error('Failed to copy text: ', err);
      toaster.error({
        title: 'Copy Failed',
        description: 'Failed to copy the value to clipboard. Please try again.',
        duration: 2000,
        closable: true,
      });
    });
};

export default function LockerItemRead({
  lockerItem,
  lockerName,
  itemContent,
}: {
  lockerItem?: DecryptedLockerItem;
  lockerName?: string;
  itemContent: ItemContent[];
}) {
  return (
    <DataList.Root orientation="horizontal" gap={2} size="sm">
      <DataList.Item display="flex" gap={2}>
        <DataList.ItemLabel flex={1} fontWeight="bold">
          Title:
        </DataList.ItemLabel>
        <DataList.ItemValue flex={2}>{lockerItem?.item.title}</DataList.ItemValue>
      </DataList.Item>
      <Separator />
      <DataList.Item display="flex" gap={2}>
        <DataList.ItemLabel flex={1} fontWeight="bold">
          Category:
        </DataList.ItemLabel>
        <DataList.ItemValue flex={2}>
          <Badge variant="surface" colorPalette="yellow">
            {camelCaseToTitleCase(lockerItem?.item.category ?? '')}
          </Badge>
        </DataList.ItemValue>
      </DataList.Item>
      <Separator />
      <DataList.Item display="flex" gap={2}>
        <DataList.ItemLabel flex={1} fontSize="xs" fontWeight="bold">
          Locker Name:
        </DataList.ItemLabel>
        <DataList.ItemValue flex={2}>{lockerName ? lockerName : lockerItem?.item.lockerId}</DataList.ItemValue>
      </DataList.Item>
      <Separator />
      <DataList.Item display="flex" gap={2}>
        <DataList.ItemLabel flex={1} fontWeight="bold">
          Integrity:
        </DataList.ItemLabel>
        <DataList.ItemValue flex={2}>
          <Badge colorPalette="green" variant="surface">
            <TbRosetteDiscountCheck />
            Verified
          </Badge>
          <Badge colorPalette="grey" variant="surface" ml={2}>
            <TbLock />
            AES-256-GCM
          </Badge>
        </DataList.ItemValue>
      </DataList.Item>

      <Flex>
        <Heading
          as="h2"
          size="md"
          fontFamily="heading"
          fontWeight="bold"
          letterSpacing="tighter"
          borderBottom="2px solid"
          borderColor="yellow.muted"
          pb={1}
          my={4}
        >
          Item Content
        </Heading>
      </Flex>

      <Flex direction="column" gap={2} mt={2}>
        {itemContent.map((value, idx) => {
          if (!value.value) return null;
          if (value.isMultiline) {
            return (
              <React.Fragment key={`item-content-fragment-${idx}`}>
                <DataList.Item display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
                  <DataList.ItemLabel fontWeight="bold">{value.label}:</DataList.ItemLabel>
                </DataList.Item>
                <DataList.ItemValue flex={2}>{value.value}</DataList.ItemValue>
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={`item-content-fragment-${idx}`}>
              <DataList.Item display="flex" gap={2}>
                <DataList.ItemLabel flex={1} fontWeight="bold">
                  {value.label}:
                </DataList.ItemLabel>
                <DataList.ItemValue flex={2} display="flex" alignItems="center" position="relative">
                  <Box
                    flex={1}
                    _hover={{ textDecoration: 'underline' }}
                    cursor="pointer"
                    onClick={() => copyToClipboard(value.value)}
                  >
                    {value.type === 'password' ? <ScreenValue>{value.value}</ScreenValue> : value.value}
                  </Box>
                </DataList.ItemValue>
              </DataList.Item>
              {idx < itemContent.length - 1 && <Separator />}
            </React.Fragment>
          );
        })}
      </Flex>
    </DataList.Root>
  );
}
