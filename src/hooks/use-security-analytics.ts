import { checkForBreaches, findRepeatedPasswords, findWeakPasswords } from '@/lib/securityCenter';
import { BreachedPassword, DecryptedLocker, DecryptedLockerItem } from '@/types/client';
import React from 'react';

export function useSecurityAnalytics(lockers: DecryptedLocker[]) {
  const repeatedPasswords = React.useMemo(() => findRepeatedPasswords(lockers), [lockers]);
  const weakPasswords = React.useMemo(() => findWeakPasswords(lockers), [lockers]);

  const [breaches, setBreaches] = React.useState<BreachedPassword[]>([]);

  React.useEffect(() => {
    let cancelled = false;

    checkForBreaches(lockers)
      .then((breached) => {
        if (!cancelled) setBreaches(breached);
      })
      .catch((error) => {
        console.error('Error checking for breaches:', error);
        if (!cancelled) setBreaches([]);
      });

    return () => {
      cancelled = true;
    };
  }, [lockers]);

  const lockerItemHasIssues = React.useCallback(
    (lockerItem: DecryptedLockerItem) => {
      return (
        repeatedPasswords.some((item) =>
          item.occurrences.some((occurrence) => occurrence.itemId === lockerItem.itemId),
        ) ||
        weakPasswords.some((item) => item.itemId === lockerItem.itemId) ||
        breaches.some((item) => item.itemId === lockerItem.itemId)
      );
    },
    [repeatedPasswords, weakPasswords, breaches],
  );

  const totalIssues = repeatedPasswords.length + weakPasswords.length + breaches.length;

  return { repeatedPasswords, weakPasswords, breaches, totalIssues, lockerItemHasIssues };
}
