'use client';

import { User } from '@/prisma/client';
import {
  Avatar,
  Box,
  Button,
  Collapsible,
  Flex,
  IconButton,
  Input,
  InputGroup,
  Menu,
  Separator,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { TbLockSquareRounded, TbMenu, TbSearch, TbSettings, TbShieldLock, TbUserCircle } from 'react-icons/tb';
import SignOutButton from './forms/signOut';
import Logo from './logo';
import { ColorModeButton } from './ui/color-mode';
import { Toaster } from './ui/toaster';

export default function AppWrapper({ children, user }: { children: React.ReactNode; user: User }) {
  return (
    <Flex direction="column" h="100vh" overflow="hidden" w="full">
      {/* --- DESKTOP LAYOUT --- */}
      <Flex direction="column" display={{ base: 'none', md: 'flex' }} h="full" w="full">
        <Box borderBottom="1px solid" borderColor="border" bg="bg.subtle" w="full" flexShrink={0} px={6} py={2}>
          <Flex w="full" direction="row" gap={4} align="center">
            <Logo asLink href="/locker" />
            <InputGroup startElement={<TbSearch />} w="full" maxW="sm" ml="auto">
              <Input placeholder="Search..." />
            </InputGroup>
            <ColorModeButton />
          </Flex>
        </Box>

        <Flex direction="row" align="stretch" h="full" w="full" flex={1} minH={0}>
          <AppBar user={user} />

          {/* Scrollable Main Area */}
          <Box as="main" flex={1} bg="bg" color="fg" overflowY="auto" minH={0}>
            {children}
          </Box>
        </Flex>
      </Flex>

      {/* --- MOBILE LAYOUT --- */}
      <Flex direction="column" display={{ base: 'flex', md: 'none' }} h="full" w="full">
        <Box borderBottom="1px solid" borderColor="border" bg="bg.subtle" w="full" flexShrink={0}>
          <Collapsible.Root>
            <Flex gap={2} px={4} py={3} align="center">
              <Logo asLink href="/locker" />
              <ColorModeButton ml="auto" />
              <Collapsible.Trigger asChild>
                <IconButton aria-label="Open navigation menu" variant="ghost">
                  <TbMenu />
                </IconButton>
              </Collapsible.Trigger>
            </Flex>

            <Collapsible.Content asChild>
              <Box py={2} borderTop="1px solid" borderColor="border">
                <NavContent user={user} />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>

        {/* Scrollable Main Area (Mobile) */}
        <Box as="main" flex={1} bg="bg" color="fg" overflowY="auto" minH={0}>
          {children}
        </Box>
      </Flex>

      <Toaster />
    </Flex>
  );
}

function NavContent({ user }: { user: User }) {
  const pathName = usePathname();
  return (
    <Flex direction="column" as="ul" flex={1} overflowY="auto" px={4} py={2} gap={2} w="full" h="full">
      <Button
        variant={pathName.startsWith('/locker') ? 'subtle' : 'ghost'}
        colorPalette="gray"
        justifyContent="flex-start"
        gap={2}
        asChild
      >
        <Link href="/locker" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TbLockSquareRounded />
          Lockers
        </Link>
      </Button>
      <Button
        variant={pathName.startsWith('/security-center') ? 'subtle' : 'ghost'}
        colorPalette="gray"
        justifyContent="flex-start"
        gap={2}
        asChild
      >
        <Link href="/security-center" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TbShieldLock />
          Security Center
        </Link>
      </Button>

      <Separator orientation="horizontal" mt="auto" />
      <Menu.Root positioning={{ placement: 'top-end' }}>
        <Menu.Trigger asChild>
          <Button variant="ghost" colorPalette="gray" w="full" h="auto" py={3} px={3}>
            <Flex direction="row" align="center" gap={3} w="full">
              <Avatar.Root variant="subtle" colorPalette="yellow">
                <Avatar.Fallback>{user?.name?.charAt(0) ?? 'U'}</Avatar.Fallback>
              </Avatar.Root>
              <Flex direction="column" align="start" gap={0} flex={1}>
                <Text fontSize="sm" fontWeight="bold" lineHeight="short" color="fg.default">
                  {user?.name ?? 'User'}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {user?.email ?? ''}
                </Text>
              </Flex>
            </Flex>
          </Button>
        </Menu.Trigger>

        <Menu.Positioner>
          <Menu.Content w={48}>
            <Menu.Item asChild value="account">
              <Link href="/account">
                <TbUserCircle />
                Account
              </Link>
            </Menu.Item>
            <Menu.Item asChild value="settings">
              <Link href="/settings">
                <TbSettings />
                Settings
              </Link>
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item asChild value="logout">
              <SignOutButton size="xs" variant="ghost" colorPalette="red" justifyContent="flex-start" />
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    </Flex>
  );
}

function AppBar({ user }: { user: User }) {
  const [viewportWidth, setViewportWidth] = React.useState<number>(0);

  const handleResize = React.useCallback(() => {
    setViewportWidth(window.innerWidth);
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewportWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const isDesktop = viewportWidth >= 768;

  return (
    <Flex
      direction="column"
      as="nav"
      h="full"
      w={isDesktop ? '64' : 'full'}
      bg="bg.subtle"
      borderRight="1px solid"
      borderColor="border"
      justify="start"
    >
      <Box flex={1} overflowY="auto" w="full">
        <NavContent user={user} />
      </Box>
    </Flex>
  );
}
