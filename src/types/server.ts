import { Prisma } from '@/prisma/client';

type ActionStateFailureType =
  | 'UNAUTHORIZED'
  | 'VALIDATION'
  | 'SERVER_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'CRYPTOGRAPHIC_ERROR'
  | 'UNKNOWN';

export type ActionState<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      type: ActionStateFailureType;
    };

export type DALResult<T> = { success: true; data: T } | { success: false; type: ActionStateFailureType };

export type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    publicKey: true;
    encryptedPrivateKey: true;
    enable2FA: true;
    name: true;
    createdAt: true;
    logins: true;
    phone: true;
    recoveryCodes: true;
  };
}>;

export type SecureItemWithAccess = Prisma.SecureItemGetPayload<{
  include: {
    accessors: {
      select: {
        userId: true;
        encryptedRecordKey: true;
        isOwner: true;
      };
    };
  };
}>;

export type VaultWithItems = Prisma.VaultGetPayload<{
  include: {
    vaultItems: {
      include: {
        item: true;
      };
    };
  };
}>;
