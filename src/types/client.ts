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
