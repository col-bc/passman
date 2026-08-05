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

export type EncryptedLocker = Prisma.LockerGetPayload<{
  include: {
    lockerItems: {
      include: {
        item: true;
      };
    };
  };
}>;
