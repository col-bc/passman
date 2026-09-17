'use client';

import { useSecurityAnalytics } from '@/hooks/use-security-analytics';
import { useVaults } from '@/hooks/use-vaults';
import { User } from '@/prisma/client';
import { VaultWithItems } from '@/types/server';
import { Box, Flex, Heading } from '@chakra-ui/react';
import React from 'react';
import BreachedPasswordsTable from './breachedPasswordsTable';
import RepeatedPasswordsTable from './repeatedPasswordsTable';
import WeakPasswordsTable from './weakPasswordsTable';
// import SecurityStatsRow from './securityStatsRow'; // Your new top row!

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

  return (
    <Flex direction="column" gap={8} w="full">
      {/* 
        <SecurityStatsRow totalIssues={totalIssues} /> 
      */}

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
