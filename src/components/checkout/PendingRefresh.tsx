"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** While a payment is being confirmed by the webhook, re-check a few times. */
export function PendingRefresh() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= 8) clearInterval(id);
    }, 4000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
