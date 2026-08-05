import { handleGetLockers } from '@/actions/lockerActions';
import LockerDetails from '@/components/presentation/lockerItemDetails';
import { getCurrentUser } from '@/lib/session';
import { Breadcrumb, Container } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

type Props = {
  params: Promise<{ lockerId: string }>;
};

export default async function LockerPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }

  const resolvedParams = await params;
  const lockerId = resolvedParams.lockerId;

  const lockersResponse = await handleGetLockers();
  if (!lockersResponse.success || !lockersResponse.data) {
    throw new Error('Failed to fetch locker data');
  }

  const lockerTitle = lockersResponse.data.find((locker) => locker.id === lockerId)?.title;
  if (!lockerTitle) {
    throw new Error('Locker not found');
  }

  return (
    <>
      <Breadcrumb.Root variant="underline" borderBottom="1px solid" borderColor="border">
        <Container maxW="5xl" px={6} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href={`/locker`}>Lockers</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>{lockerTitle}</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" p={6}>
        <LockerDetails lockerId={lockerId} encryptedLockers={lockersResponse.data} />
      </Container>
    </>
  );
}
