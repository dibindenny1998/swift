"use client";

import { useState } from "react";
import { Button, Drawer, Input } from "@/components/ui";

export function DrawerDemo() {
  const [side, setSide] = useState<"right" | "bottom" | null>(null);
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" size="sm" onClick={() => setSide("right")}>
        Open right drawer
      </Button>
      <Button variant="outline" size="sm" onClick={() => setSide("bottom")}>
        Open bottom sheet
      </Button>
      <Drawer open={side !== null} onClose={() => setSide(null)} title="Your cart" side={side ?? "right"}>
        <p className="text-[15px] text-muted">Drawers close with Escape, the backdrop, or the close button.</p>
        <Input className="mt-5" label="Coupon code" placeholder="MERRY10" />
      </Drawer>
    </div>
  );
}
