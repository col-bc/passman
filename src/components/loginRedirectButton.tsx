'use client';

import { Button, ButtonProps } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function LoginRedirectButton({ children, ...props }: ButtonProps & { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const nextUrl = encodeURIComponent(pathname);

  const handleClick = () => {
    router.push(`/login?next=${nextUrl}`);
  };

  return (
    <Link href={`/auth/sign-in?next=${nextUrl}`} passHref>
      <Button onClick={handleClick} {...props}>
        {children}
      </Button>
    </Link>
  );
}
