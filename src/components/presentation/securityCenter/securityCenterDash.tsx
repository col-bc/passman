'use client';

import { useSecurityAnalytics } from '@/hooks/use-security-analytics';
import { useVaults } from '@/hooks/use-vaults';
import { User } from '@/prisma/client';
import { VaultWithItems } from '@/types/server';
import { Alert, Box, Card, Flex, Heading, Link, List, Separator, Text } from '@chakra-ui/react';
import React from 'react';
import { TbInfoCircle } from 'react-icons/tb';
import BreachedPasswordsTable from './breachedPasswordsTable';
import RepeatedPasswordsTable from './repeatedPasswordsTable';
import WeakPasswordsTable from './weakPasswordsTable';
// import SecurityStatsRow from './securityStatsRow'; // Your new top row!
import NextLink from 'next/link';
import SecurityScore from '../securityScore';

export default function SecurityCenterDash({
  user,
  encryptedVaults,
}: {
  user: User;
  encryptedVaults: VaultWithItems[];
}) {
  const { vaults, handleUnlock, mek } = useVaults();
  const { issues } = useSecurityAnalytics(vaults);

  React.useEffect(() => {
    if (!mek || encryptedVaults.length === 0) return;
    const encryptedItemCount = encryptedVaults.reduce((acc, l) => acc + l.vaultItems.length, 0);
    const decryptedItemCount = vaults.reduce((acc, l) => acc + l.vaultItems.length, 0);

    if (vaults.length === 0 || encryptedItemCount !== decryptedItemCount) {
      handleUnlock(encryptedVaults).catch(console.error);
    }
  }, [mek, encryptedVaults, vaults, handleUnlock]);

  const vaultsWithoutMonitoring = vaults.filter((v) => !v.enableMonitoring);

  return (
    <Flex direction="column" gap={8} w="full">
      <Flex
        direction={{
          base: 'column',
          md: 'row',
        }}
        gap={{ base: 4, md: 8 }}
      >
        <Flex direction="column" gap={4} mb={8} flex={1}>
          <Heading as="h1" fontSize="3xl" fontWeight="extrabold" letterSpacing="tight" whiteSpace="nowrap" flex={1}>
            Security Center
          </Heading>
          <Text color="muted" fontSize="sm" flexShrink={0}>
            Review and manage security exceptions across all your vaults. Resolve issues to enhance your overall
            security score and enhance your data protection.
          </Text>
        </Flex>
        <Card.Root maxW="2xs" w="full" size="sm" variant="subtle">
          <Card.Header>
            <Heading as="h3" size="md">
              Security Score
            </Heading>
          </Card.Header>
          <Card.Body>
            <SecurityScore vaults={vaults} mx="auto" size="xl" />
          </Card.Body>
        </Card.Root>
      </Flex>
      {/* 
        <SecurityStatsRow totalIssues={totalIssues} /> 
      */}

      {vaultsWithoutMonitoring.length > 0 && (
        <Box>
          <Alert.Root>
            <Alert.Indicator>
              <TbInfoCircle />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title>Some of you vaults are not being monitored</Alert.Title>
              <Alert.Description>
                All of your security exceptions may not be displayed here if monitoring is not enabled for some vaults.
              </Alert.Description>
              <Separator borderColor="border.info" my={2} />
              <Heading as="h6" size="sm">
                Vaults without monitoring
              </Heading>
              <List.Root as="ul" listStyleType="disc" pl={5}>
                {vaultsWithoutMonitoring.map((vault) => (
                  <List.Item key={vault.id}>
                    <Link asChild>
                      <NextLink href={`/vaults/${vault.id}?showMonitoring=true`}>{vault.title}</NextLink>
                    </Link>
                  </List.Item>
                ))}
              </List.Root>
            </Alert.Content>
          </Alert.Root>
        </Box>
      )}

      <Box>
        <Flex>
          <Heading
            as="h2"
            size="2xl"
            mb={6}
            fontFamily="heading"
            fontWeight="bolder"
            letterSpacing="tighter"
            borderBottom="2px solid"
            borderColor="yellow.muted"
            pb={1}
          >
            Repeated Passwords
          </Heading>
        </Flex>
        <RepeatedPasswordsTable repeatedPasswords={issues.repeatPasswords} />
      </Box>

      <Box>
        <Flex>
          <Heading
            w="auto"
            as="h2"
            size="2xl"
            mb={6}
            fontFamily="heading"
            fontWeight="bolder"
            letterSpacing="tighter"
            borderBottom="2px solid"
            borderColor="yellow.muted"
            pb={1}
          >
            Weak Passwords
          </Heading>
        </Flex>
        <WeakPasswordsTable weakPasswords={issues.weakPasswords} />
      </Box>

      <Box>
        <Flex>
          <Heading
            w="auto"
            as="h2"
            size="2xl"
            mb={6}
            fontFamily="heading"
            fontWeight="bolder"
            letterSpacing="tighter"
            borderBottom="2px solid"
            borderColor="yellow.muted"
            pb={1}
          >
            Breached Passwords
          </Heading>
        </Flex>
        <BreachedPasswordsTable breachedPasswords={issues.breaches} />
      </Box>
    </Flex>
  );
}
