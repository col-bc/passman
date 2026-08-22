'use client';

import { useLocker } from '@/hooks/use-locker';
import { useSecurityAnalytics } from '@/hooks/use-security-analytics';
import { User } from '@/prisma/client';
import { EncryptedLocker } from '@/types/server';
import { Box, Flex, Heading } from '@chakra-ui/react';
import React from 'react';
import BreachedPasswordsTable from './breachedPasswordsTable';
import RepeatedPasswordsTable from './repeatedPasswordsTable';
import WeakPasswordsTable from './weakPasswordsTable';
// import SecurityStatsRow from './securityStatsRow'; // Your new top row!

export default function SecurityCenterDash({
  user,
  encryptedLockers,
}: {
  user: User;
  encryptedLockers: EncryptedLocker[];
}) {
  const { lockers, handleUnlock, mek } = useLocker();
  const { repeatedPasswords, weakPasswords, breaches } = useSecurityAnalytics(lockers);

  // Consolidated auto-unlock effect
  React.useEffect(() => {
    if (!mek || encryptedLockers.length === 0) return;
    const encryptedItemCount = encryptedLockers.reduce((acc, l) => acc + l.lockerItems.length, 0);
    const decryptedItemCount = lockers.reduce((acc, l) => acc + l.lockerItems.length, 0);

    if (lockers.length === 0 || encryptedItemCount !== decryptedItemCount) {
      handleUnlock(encryptedLockers).catch(console.error);
    }
  }, [mek, encryptedLockers, lockers, handleUnlock]);

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
        <RepeatedPasswordsTable repeatedPasswords={repeatedPasswords} />
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
        <WeakPasswordsTable weakPasswords={weakPasswords} />
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
        <BreachedPasswordsTable breachedPasswords={breaches} />
      </Box>
    </Flex>
  );
}
