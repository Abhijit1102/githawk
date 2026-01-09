"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const Logout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <span className={className} onClick={handleLogout}>
      {children}
    </span>
  );
};

export default Logout;
