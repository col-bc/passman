import { Item, Locker, LockerItems } from '@/prisma/client';

export type ItemContent = {
  type: string;
  label: string;
  value: string;
  isSensitive?: boolean;
  isRequired?: boolean;
  isMultiline?: boolean;
  order?: number;
};

export type DecryptedItem = Item & {
  decryptedData?: string;
};

export type DecryptedLockerItem = LockerItems & {
  id: string;
  item: DecryptedItem;
};

export type DecryptedLocker = Locker & {
  lockerItems: DecryptedLockerItem[];
};

export type PasswordOccurrence = {
  itemId: string;
  itemName: string;
  lockerId: string;
  lockerName: string;
  label: string;
  fieldIndex?: number;
};

export type RepeatedPassword = {
  password: string;
  count: number;
  occurrences: PasswordOccurrence[];
};

export type WeakPassword = {
  itemId: string;
  itemName: string;
  lockerId: string;
  lockerName: string;
  label: string;
  password: string;
  problems: number;
  warnings: string[];
  suggestions: string[];
  fieldIndex: number;
};

export type BreachedPassword = {
  itemId: string;
  itemName: string;
  lockerId: string;
  lockerName: string;
  label: string;
  password: string;
  breachCount: number;
  breachSources?: string[];
  fieldIndex: number;
};
