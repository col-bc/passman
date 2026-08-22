import {
  BreachedPassword,
  DecryptedLocker,
  ItemContent,
  PasswordOccurrence,
  RepeatedPassword,
  WeakPassword,
} from '@/types/client';
import zxcvbn from 'zxcvbn';

/**
 * Checks for breached passwords using the Have I Been Pwned API.
 * @param decryptedLockers - An array of decrypted lockers containing items with passwords to check.
 * @returns {Promise<BreachedPassword[]>} - A promise that resolves to an array of breached passwords.
 */
export async function checkForBreaches(decryptedLockers: DecryptedLocker[]): Promise<BreachedPassword[]> {
  const allItems = decryptedLockers.flatMap((l) => l.lockerItems);
  const breachedPasswords: BreachedPassword[] = [];

  for (const item of allItems) {
    const fields = Object.values(item.item.decryptedData!) as unknown as ItemContent[];
    for (const [index, field] of fields.entries()) {
      if (field.type === 'password' && field.value) {
        const fullHash = await window.crypto.subtle
          .digest('SHA-1', new TextEncoder().encode(field.value))
          .then((hashBuffer) => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')
              .toUpperCase();
          });

        const sha1Prefix = fullHash.slice(0, 5);
        const expectedSuffix = fullHash.slice(5);

        try {
          const response = await fetch(`https://api.pwnedpasswords.com/range/${sha1Prefix}`);
          if (!response.ok) continue;

          const text = await response.text();
          const lines = text.split('\n').map((line) => line.trim());
          const match = lines.find((line) => line.split(':')[0] === expectedSuffix);

          if (match) {
            const [, count] = match.split(':');
            breachedPasswords.push({
              itemId: item.item.id,
              itemName: item.item.title,
              lockerId: item.lockerId,
              lockerName: decryptedLockers.find((l) => l.id === item.lockerId)?.title || 'Unknown Locker',
              label: field.label,
              password: field.value,
              breachCount: parseInt(count, 10),
              breachSources: ['Have I Been Pwned'],
              fieldIndex: index,
            });
          }
        } catch (error) {
          console.error('Failed to check password against HIBP:', error);
        }
      }
    }
  }
  return breachedPasswords;
}

/**
 * Finds repeated passwords across all lockers.
 * @param lockers - An array of decrypted lockers containing items with passwords to check.
 * @returns {RepeatedPassword[]} - An array of repeated passwords found across the lockers.
 */
export function findRepeatedPasswords(lockers: DecryptedLocker[]): RepeatedPassword[] {
  const passwordTracker = new Map<string, PasswordOccurrence[]>();

  for (const locker of lockers) {
    for (const item of locker.lockerItems) {
      if (item.item.category === 'credentials' && item.item.decryptedData) {
        const fields = Object.values(item.item.decryptedData) as unknown as ItemContent[];

        for (const [index, field] of fields.entries()) {
          if (field.type === 'password' && field.value) {
            const currentOccurrences = passwordTracker.get(field.value) || [];

            currentOccurrences.push({
              itemId: item.item.id,
              itemName: item.item.title,
              lockerId: locker.id,
              lockerName: locker.title,
              label: field.label,
              fieldIndex: index,
            });

            passwordTracker.set(field.value, currentOccurrences);
          }
        }
      }
    }
  }

  const repeatedPasswords: RepeatedPassword[] = [];

  for (const [password, occurrences] of passwordTracker.entries()) {
    if (occurrences.length > 1) {
      repeatedPasswords.push({
        password,
        count: occurrences.length,
        occurrences,
      });
    }
  }

  return repeatedPasswords;
}

/** * Checks for weak passwords using the zxcvbn library.
 * @param lockers - An array of decrypted lockers containing items with passwords to check.
 * @returns {WeakPassword[]} - An array of weak passwords found across the lockers.
 */
export function findWeakPasswords(lockers: DecryptedLocker[]): WeakPassword[] {
  const allItems = lockers.flatMap((l) => l.lockerItems);
  const weakPasswordsList: WeakPassword[] = [];

  for (const item of allItems) {
    const fields = Object.values(item.item.decryptedData!) as unknown as ItemContent[];
    for (const [index, field] of fields.entries()) {
      if (field.type === 'password') {
        const analysis = zxcvbn(field.value);
        if (analysis.score < 3) {
          weakPasswordsList.push({
            itemId: item.item.id,
            itemName: item.item.title,
            lockerId: item.lockerId,
            lockerName: lockers.find((l) => l.id === item.lockerId)?.title || 'Unknown Locker',
            label: field.label,
            password: field.value,
            problems: (4 - analysis.score + (analysis.feedback.warning ? 1 : 0)) as number,
            warnings: analysis.feedback.warning ? [analysis.feedback.warning] : [],
            suggestions: analysis.feedback.suggestions,
            fieldIndex: index,
          });
        }
      }
    }
  }
  return weakPasswordsList;
}
