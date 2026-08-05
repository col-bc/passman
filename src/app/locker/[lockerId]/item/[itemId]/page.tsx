import { handleGetLockerById, handleGetLockerItem } from '@/actions/lockerActions';
import LockerError from '@/components/presentation/lockerError';
import LockerItemWrapper from '@/components/presentation/lockerWrapper';
import { getCurrentUser } from '@/lib/session';
import { EncryptedLocker } from '@/types/server';
import { Avatar, Box, Breadcrumb, Card, Code, Container, Flex, Heading } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';
import { TbBuildingBank, TbCreditCard, TbCube, TbFileTypography, TbHash, TbId, TbPasswordUser } from 'react-icons/tb';

type Props = {
  params: Promise<{
    lockerId: string;
    itemId: string;
  }>;
};

export default async function LockerItemDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    unauthorized();
  }

  const resolvedParams = await params;
  const lockerId = resolvedParams.lockerId;
  const itemId = resolvedParams.itemId;

  const encryptedLocker = await handleGetLockerById(lockerId);
  if (!encryptedLocker.success || !encryptedLocker.data) {
    if (!encryptedLocker.success) {
      return <LockerError text={encryptedLocker.error || 'Failed to fetch locker data'} type={encryptedLocker.type} />;
    }
  }
  if (encryptedLocker.data.id) {
  }
  const encryptedItem = await handleGetLockerItem(lockerId, itemId);
  if (!encryptedItem.success || !encryptedItem.data) {
    if (!encryptedItem.success) {
      return <LockerError text={encryptedItem.error || 'Failed to fetch locker item data'} type={encryptedItem.type} />;
    }
  }

  const item = encryptedItem.data;

  const templateIcon = (category: string) => {
    switch (category) {
      case 'login':
        return <TbPasswordUser className="size-10" />;
      case 'secureNote':
        return <TbFileTypography className="size-10" />;
      case 'bankAccount':
        return <TbBuildingBank className="size-10" />;
      case 'creditCard':
        return <TbCreditCard className="size-10" />;
      case 'identity':
        return <TbId className="size-10" />;
      default:
        return <TbCube className="size-10" />;
    }
  };

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
              <Breadcrumb.Link href={`/locker/${encryptedLocker.data.id}`}>
                {encryptedLocker.data.title}
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>{item.title}</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="xl" p={6}>
        <Flex direction="column" as="section" gap={8}>
          <Box>
            <Heading as="h1" mb={2} size="3xl" fontFamily="heading" fontWeight="bolder">
              <Flex align="center" gap={2}>
                <Avatar.Root variant="subtle" colorPalette="yellow">
                  <Avatar.Fallback>{templateIcon(item.category)}</Avatar.Fallback>
                </Avatar.Root>
                {item.title}
              </Flex>
            </Heading>
            <Code display="inline-flex" alignItems="center" gap={2}>
              <TbHash />
              {item.id}
            </Code>
          </Box>
          <Card.Root variant="outline" w="full" mx="auto" mb={8} p={8}>
            <LockerItemWrapper
              lockerId={lockerId}
              itemId={itemId}
              encryptedLockers={[encryptedLocker.data] as EncryptedLocker[]}
            />
          </Card.Root>
        </Flex>
      </Container>
    </>
  );
}
