import { Breadcrumb, Container, Heading, Skeleton } from '@chakra-ui/react';

export default function NewLockerPage() {
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
              <Breadcrumb.CurrentLink>New Locker</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" py={8} px={4}>
        <Heading as="h1" size="3xl" mb={8} fontFamily="heading" fontWeight="bolder" letterSpacing="tighter">
          Create New Locker
        </Heading>

        <Skeleton height={80} borderRadius="md" w="full" maxW="md" />
      </Container>
    </>
  );
}
