import { User } from '@/prisma/client';
import { Box, Button, ClientOnly, Collapsible, Container, Flex, Menu, Separator, Skeleton } from '@chakra-ui/react';
import Link from 'next/link';
import { TbLockSquareRounded, TbLogin, TbMenu, TbUser, TbUserPlus } from 'react-icons/tb';
import SignOutButton from './forms/signOut';
import Logo from './logo';
import { ColorModeButton } from './ui/color-mode';

function Navbar({ user }: { user: User | null }) {
  return (
    <Box as="nav" color="fg" bg="bg.panel" borderBottomWidth={1} borderBottomColor="border">
      <Collapsible.Root>
        <Container maxW="5xl" py={4} px={8}>
          <Flex align="center">
            <Logo asLink href="/locker" />
            <Box flex={1} mx={4} display={{ base: 'none', md: 'flex' }} gap={2}>
              <Button variant="ghost" colorScheme="whiteAlpha" size="sm" asChild>
                <Link href="/contact">About</Link>
              </Button>
              <Button variant="ghost" colorScheme="whiteAlpha" size="sm" asChild>
                <Link href="/contact">Contact</Link>
              </Button>
            </Box>
            <Flex gap={2} align="center" ml="auto">
              <ClientOnly fallback={<Skeleton width={8} height={8} />}>
                <ColorModeButton />
              </ClientOnly>
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="outline" colorPalette="yellow" size="sm">
                    <TbUser size={20} />
                    {user ? user.name : 'Accounts'}
                  </Button>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content w={48}>
                    {!user && (
                      <>
                        <Menu.Item value="sign-in" asChild>
                          <Link href="/auth/sign-in">
                            <TbLogin size={16} />
                            Sign In
                          </Link>
                        </Menu.Item>
                        <Menu.Item value="sign-up" asChild>
                          <Link href="/auth/sign-up">
                            <TbUserPlus size={16} />
                            Sign Up
                          </Link>
                        </Menu.Item>
                      </>
                    )}
                    {user && (
                      <>
                        <Menu.Item value="lockers" asChild>
                          <Link href="/locker">
                            <TbLockSquareRounded size={16} />
                            Lockers
                          </Link>
                        </Menu.Item>

                        <Menu.Item value="profile" asChild>
                          <Link href="/profile">
                            <TbUser size={16} />
                            Profile
                          </Link>
                        </Menu.Item>

                        <Menu.Item value="sign-out" asChild>
                          <SignOutButton variant="ghost" colorPalette="red" size="sm" justifyContent="start" />
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
              <ClientOnly fallback={<Skeleton width={8} height={8} />}>
                <Collapsible.Trigger asChild>
                  <Button
                    display={{
                      base: 'inline-flex',
                      md: 'none',
                    }}
                    variant="plain"
                    colorPalette="yellow"
                    size="sm"
                  >
                    <TbMenu size={20} />
                  </Button>
                </Collapsible.Trigger>
              </ClientOnly>
            </Flex>
          </Flex>
          <Collapsible.Content>
            <Flex display={{ base: 'flex', md: 'none' }} direction="column" gap={1} mt={4}>
              <Button variant="ghost" colorScheme="whiteAlpha" size="sm" w="full" justifyContent="flex-start" asChild>
                <Link href="/contact">About</Link>
              </Button>
              <Separator />
              <Button variant="ghost" colorScheme="whiteAlpha" size="sm" w="full" justifyContent="flex-start" asChild>
                <Link href="/contact">Contact</Link>
              </Button>
            </Flex>
          </Collapsible.Content>
        </Container>
      </Collapsible.Root>
    </Box>
  );
}
Navbar.displayName = 'Navbar';

export default Navbar;
