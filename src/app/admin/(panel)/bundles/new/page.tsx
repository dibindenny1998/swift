import { Suspense } from "react";
import { BundleEditor } from "@/components/admin/BundleEditor";
import { AdminSkeleton, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { variantOptions } from "@/lib/admin-forms";

export const metadata = { title: "New bundle" };

export default function NewBundlePage(props: PageProps<"/admin/bundles/new">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewBundle searchParams={props.searchParams} />
    </Suspense>
  );
}

async function NewBundle({ searchParams }: Pick<PageProps<"/admin/bundles/new">, "searchParams">) {
  await requireAdmin("/admin/bundles/new");
  const type = (await searchParams).type === "BUILD_YOUR_OWN" ? "BUILD_YOUR_OWN" : "FIXED";
  const variants = await variantOptions();
  return (
    <>
      <PageHeader title={type === "FIXED" ? "New kit" : "Build-your-own gift box"} />
      <BundleEditor
        variants={variants}
        initial={{
          title: type === "FIXED" ? "" : "Build Your Own Gift Box",
          slug: type === "FIXED" ? "" : "build-your-own-gift-box",
          description: "",
          type,
          discountType: "PERCENT",
          discountValue: 10,
          isLive: false,
          imageUrl: null,
          items: [],
          tiers: type === "FIXED" ? [] : [{ minItems: 3, percentOff: 10 }],
        }}
      />
    </>
  );
}
