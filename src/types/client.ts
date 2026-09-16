import { SecureItem, Vault, VaultSecureItems } from '@/prisma/client';

export type ItemContent = {
  type: string;
  label: string;
  value: string;
  isSensitive?: boolean;
  isRequired?: boolean;
  isMultiline?: boolean;
  order?: number;
};

export type EncryptedVaultItemDTO = Omit<SecureItem, 'accessors' | 'vaultItems'> & {
  // Flattened from the ItemAccess table specifically for the requesting user
  encryptedRecordKey: string;
  isOwner: boolean;
};

export type DecryptedItem = Omit<EncryptedVaultItemDTO, 'ciphertext' | 'iv' | 'tag' | 'encryptedRecordKey'> & {
  decryptedData: ItemContent[];
};

export type DecryptedVaultItem = VaultSecureItems & {
  item: DecryptedItem;
};

export type DecryptedVault = Vault & {
  vaultItems: DecryptedVaultItem[];
};

export type PasswordOccurrence = {
  itemId: string;
  itemName: string;
  vaultId: string;
  vaultName: string;
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
  vaultId: string;
  vaultName: string;
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
  vaultId: string;
  vaultName: string;
  label: string;
  password: string;
  breachCount: number;
  breachSources?: string[];
  fieldIndex: number;
};
