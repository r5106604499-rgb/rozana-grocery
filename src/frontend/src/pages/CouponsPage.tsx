import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { useCoupons } from "@/hooks/useCoupons";
import { formatPaise, toNumber } from "@/lib/format";
import type { Coupon } from "@/types/app";
import { useNavigate } from "@tanstack/react-router";
import { BadgePercent, Check, Copy, Tag } from "lucide-react";
import { useState } from "react";

interface CouponCardProps {
  coupon: Coupon;
  copied: boolean;
  onCopy: (code: string) => void;
}

/** One coupon with its terms and a copy-code action. */
function CouponCard({ coupon, copied, onCopy }: CouponCardProps) {
  const percent = toNumber(coupon.discountPercent);

  return (
    <article
      data-ocid="coupon_item"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-subtle"
    >
      <div className="flex items-stretch">
        <div className="bg-gradient-deal flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 px-2 py-4 text-accent-foreground">
          <span className="font-display text-xl font-extrabold leading-none">
            {percent}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            OFF
          </span>
        </div>
        <div className="min-w-0 flex-1 p-3.5">
          <p className="font-display text-sm font-bold text-foreground">
            {coupon.description}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Min. order {formatPaise(coupon.minOrderValue)} · Up to{" "}
            {formatPaise(coupon.maxDiscount)} off
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              data-ocid="coupon_code"
              className="rounded-md border border-dashed border-primary/50 bg-primary/5 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-primary"
            >
              {coupon.code}
            </span>
            <Button
              type="button"
              variant={copied ? "secondary" : "outline"}
              size="sm"
              data-ocid="coupon_copy_button"
              onClick={() => onCopy(coupon.code)}
              className="gap-1.5 rounded-full"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Available coupon codes with copy-to-clipboard. */
export function CouponsPage() {
  const navigate = useNavigate();
  const couponsQuery = useCoupons();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = couponsQuery.data ?? [];

  const handleCopy = (code: string) => {
    const markCopied = () => {
      setCopiedCode(code);
      window.setTimeout(() => {
        setCopiedCode((current) => (current === code ? null : current));
      }, 4000);
    };

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(code).then(markCopied, markCopied);
    } else {
      markCopied();
    }
  };

  if (couponsQuery.isLoading) {
    return (
      <Layout title="Coupons">
        <LoadingState rows={3} />
      </Layout>
    );
  }

  if (couponsQuery.isError) {
    return (
      <Layout title="Coupons">
        <ErrorState
          title="Couldn't load coupons"
          message="We couldn't fetch the latest offers. Please try again."
          onRetry={() => void couponsQuery.refetch()}
        />
      </Layout>
    );
  }

  if (coupons.length === 0) {
    return (
      <Layout title="Coupons">
        <EmptyState
          icon={BadgePercent}
          title="No coupons available"
          message="New offers drop every week. Check back soon for fresh savings."
          actionLabel="Start shopping"
          onAction={() => void navigate({ to: "/" })}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Coupons">
      <div data-ocid="coupons_page" className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2.5">
          <Tag
            className="h-4 w-4 shrink-0 text-accent-foreground"
            aria-hidden="true"
          />
          <p className="text-xs font-medium text-foreground">
            Copy a code and apply it at checkout to save on your order.
          </p>
        </div>

        <div data-ocid="coupons_list" className="space-y-3">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id.toString()}
              coupon={coupon}
              copied={copiedCode === coupon.code}
              onCopy={handleCopy}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
