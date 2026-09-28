import ScreenValue from '@/components/ui/screenValue';
import { toaster } from '@/components/ui/toaster';
import { camelCaseToTitleCase } from '@/lib/util/formats';
import { DecryptedVaultItem, ItemContent } from '@/types/client';
import { Badge, Box, DataList, Flex, Heading, ProgressCircle, Separator } from '@chakra-ui/react';
import React from 'react';
import { TbLock, TbRosetteDiscountCheck } from 'react-icons/tb';
import zxcvbn from 'zxcvbn';

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

export default function VaultItemRead({
  vaultItem,
  vaultName,
  itemContent,
}: {
  vaultItem?: DecryptedVaultItem;
  vaultName?: string;
  itemContent: ItemContent[];
}) {
  const getScore = (value: string) => {
    return zxcvbn(value).score;
  };

  const getColor = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 50) return 'orange';
    return 'red';
  };

  return (
    <DataList.Root orientation="horizontal" size="sm" gap={0}>
      <DataList.Item display="flex" gap={2} py={2}>
        <DataList.ItemLabel flex={1} fontWeight="bold">
          Title:
        </DataList.ItemLabel>
        <DataList.ItemValue flex={2}>{vaultItem?.item.title}</DataList.ItemValue>
      </DataList.Item>
      <Separator />
      <DataList.Item display="flex" gap={2} py={2}>
        <DataList.ItemLabel flex={1} fontWeight="bold">
          Category:
        </DataList.ItemLabel>
        <DataList.ItemValue flex={2}>
          <Badge variant="surface" colorPalette="yellow">
            {camelCaseToTitleCase(vaultItem?.item.category ?? '')}
          </Badge>
        </DataList.ItemValue>
      </DataList.Item>
      <Separator />
      <DataList.Item display="flex" gap={2} py={2}>
        <DataList.ItemLabel flex={1} fontSize="xs" fontWeight="bold">
          Vault Name:
        </DataList.ItemLabel>
        <DataList.ItemValue flex={2}>{vaultName ? vaultName : vaultItem?.vaultId}</DataList.ItemValue>
      </DataList.Item>
      <Separator />
      <DataList.Item display="flex" gap={2} py={2}>
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

      <Flex direction="column" mt={2}>
        {itemContent.map((value, idx) => {
          if (!value.value) return null;
          if (value.isMultiline) {
            return (
              <React.Fragment key={`item-content-fragment-${idx}`}>
                <DataList.Item display="flex" flexDirection="column" alignItems="flex-start" gap={2} py={2}>
                  <DataList.ItemLabel fontWeight="bold">{value.label}:</DataList.ItemLabel>
                </DataList.Item>
                <DataList.ItemValue flex={2}>{value.value}</DataList.ItemValue>
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={`item-content-fragment-${idx}`}>
              <DataList.Item display="flex" gap={2} _hover={{ backgroundColor: 'bg.muted' }} py={2}>
                <DataList.ItemLabel flex={1} fontWeight="bold">
                  {value.label}:
                </DataList.ItemLabel>
                <DataList.ItemValue flex={2} display="flex" alignItems="center" position="relative">
                  <Box flex={1} cursor="pointer" onClick={() => copyToClipboard(value.value)}>
                    {value.type === 'password' ? (
                      <Flex alignItems="center" justify="space-between" gap={2} pr={2}>
                        <ScreenValue>{value.value}</ScreenValue>
                        <ProgressCircle.Root
                          value={getScore(value.value) * 25}
                          size="xs"
                          colorPalette={getColor(getScore(value.value) * 25)}
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <ProgressCircle.Label fontSize="2xs">
                            {getScore(value.value) * 25 < 50
                              ? 'WEAK'
                              : getScore(value.value) * 25 < 75
                                ? 'MODERATE'
                                : 'STRONG'}
                          </ProgressCircle.Label>
                          <ProgressCircle.Circle>
                            <ProgressCircle.Track />
                            <ProgressCircle.Range />
                          </ProgressCircle.Circle>
                        </ProgressCircle.Root>
                      </Flex>
                    ) : (
                      value.value
                    )}
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
