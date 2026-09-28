import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { AdminGuard, AdminQueryState } from "@/components/admin/AdminGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminAddCoupon,
  useAdminCoupons,
  useAdminDeleteCoupon,
  useAdminUpdateCoupon,
} from "@/hooks/useAdmin";
import { formatPaise, toNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Coupon, CouponId } from "@/types/app";
import { BadgePercent, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface CouponFormState {
  code: string;
  description: string;
  discountPercent: string;
  minOrderValue: string;
  maxDiscount: string;
  active: boolean;
}

const EMPTY_FORM: CouponFormState = {
  code: "",
  description: "",
  discountPercent: "",
  minOrderValue: "",
  maxDiscount: "",
  active: true,
};

function rupeesToPaise(value: string): bigint | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const rupees = Number(trimmed);
  if (!Number.isFinite(rupees) || rupees < 0) return null;
  return BigInt(Math.round(rupees * 100));
}

function couponToForm(coupon: Coupon): CouponFormState {
  return {
    code: coupon.code,
    description: coupon.description,
    discountPercent: coupon.discountPercent.toString(),
    minOrderValue: (Number(coupon.minOrderValue) / 100).toString(),
    maxDiscount: (Number(coupon.maxDiscount) / 100).toString(),
    active: coupon.active,
  };
}

function CouponsContent() {
  const couponsQuery = useAdminCoupons();
  const addCoupon = useAdminAddCoupon();
  const updateCoupon = useAdminUpdateCoupon();
  const deleteCoupon = useAdminDeleteCoupon();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<CouponId | null>(null);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const coupons = couponsQuery.data ?? [];

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm(couponToForm(coupon));
    setFormError(null);
    setDialogOpen(true);
  };

  const updateField = <K extends keyof CouponFormState>(
    field: K,
    value: CouponFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    const description = form.description.trim();
    const discountPercent = Number(form.discountPercent);
    const minOrderValue = rupeesToPaise(form.minOrderValue);
    const maxDiscount = rupeesToPaise(form.maxDiscount);

    if (!code) {
      setFormError("Enter a coupon code.");
      return;
    }
    if (!/^[A-Z0-9]{3,20}$/.test(code)) {
      setFormError("Use 3–20 letters or numbers, e.g. SAVE20.");
      return;
    }
    if (!Number.isFinite(discountPercent) || discountPercent <= 0) {
      setFormError("Enter a discount percentage greater than 0.");
      return;
    }
    if (discountPercent > 100) {
      setFormError("Discount percentage cannot exceed 100.");
      return;
    }
    if (minOrderValue === null) {
      setFormError("Enter a valid minimum order value in rupees.");
      return;
    }
    if (maxDiscount === null || maxDiscount <= 0n) {
      setFormError("Enter a valid maximum discount in rupees.");
      return;
    }

    const input = {
      code,
      description,
      discountPercent: BigInt(Math.trunc(discountPercent)),
      minOrderValue,
      maxDiscount,
      active: form.active,
    };

    const onError = (error: Error) => setFormError(error.message);
    if (editingId !== null) {
      updateCoupon.mutate(
        { couponId: editingId, input },
        { onSuccess: () => setDialogOpen(false), onError },
      );
    } else {
      addCoupon.mutate(input, {
        onSuccess: () => setDialogOpen(false),
        onError,
      });
    }
  };

  const isSaving = addCoupon.isPending || updateCoupon.isPending;

  return (
    <AdminQueryState
      isLoading={couponsQuery.isLoading}
      isError={couponsQuery.isError}
      onRetry={() => void couponsQuery.refetch()}
    >
      <div className="space-y-4">
        <Button
          type="button"
          data-ocid="admin_add_coupon_button"
          onClick={openAdd}
          className="w-full gap-1.5 rounded-full"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add coupon
        </Button>

        {coupons.length === 0 ? (
          <EmptyState
            icon={BadgePercent}
            title="No coupons yet"
            message="Create a discount coupon to run your first offer."
            actionLabel="Add coupon"
            onAction={openAdd}
          />
        ) : (
          <ul className="space-y-2">
            {coupons.map((coupon, index) => (
              <li
                key={coupon.id.toString()}
                data-ocid={`admin_coupon_item.${index + 1}`}
                className="space-y-2 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
                      {coupon.code}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {coupon.description || "No description"}
                    </p>
                  </div>
                  <Badge
                    variant={coupon.active ? "default" : "secondary"}
                    className={cn(
                      "shrink-0",
                      coupon.active && "bg-success/15 text-savings",
                    )}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {toNumber(coupon.discountPercent)}% off
                  </span>
                  <span>Min {formatPaise(coupon.minOrderValue)}</span>
                  <span>Up to {formatPaise(coupon.maxDiscount)}</span>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-ocid={`admin_edit_coupon_button.${index + 1}`}
                    onClick={() => openEdit(coupon)}
                    className="gap-1.5 rounded-full"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete coupon ${coupon.code}`}
                    data-ocid={`admin_delete_coupon_button.${index + 1}`}
                    disabled={deleteCoupon.isPending}
                    onClick={() => deleteCoupon.mutate(coupon.id)}
                    className="gap-1.5 rounded-full text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "Edit coupon" : "Add coupon"}
            </DialogTitle>
            <DialogDescription>
              Discounts apply to the cart subtotal, capped at the maximum
              discount.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-code">Code</Label>
              <Input
                id="coupon-code"
                data-ocid="admin_coupon_code_input"
                value={form.code}
                onChange={(event) =>
                  updateField("code", event.target.value.toUpperCase())
                }
                placeholder="e.g. SAVE20"
                className="uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coupon-description">Description</Label>
              <Textarea
                id="coupon-description"
                data-ocid="admin_coupon_description_input"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="e.g. 20% off on orders above ₹499"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="coupon-percent">Discount %</Label>
                <Input
                  id="coupon-percent"
                  inputMode="numeric"
                  data-ocid="admin_coupon_percent_input"
                  value={form.discountPercent}
                  onChange={(event) =>
                    updateField("discountPercent", event.target.value)
                  }
                  placeholder="20"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coupon-min">Min order ₹</Label>
                <Input
                  id="coupon-min"
                  inputMode="decimal"
                  data-ocid="admin_coupon_min_order_input"
                  value={form.minOrderValue}
                  onChange={(event) =>
                    updateField("minOrderValue", event.target.value)
                  }
                  placeholder="499"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coupon-max">Max ₹</Label>
                <Input
                  id="coupon-max"
                  inputMode="decimal"
                  data-ocid="admin_coupon_max_discount_input"
                  value={form.maxDiscount}
                  onChange={(event) =>
                    updateField("maxDiscount", event.target.value)
                  }
                  placeholder="150"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="coupon-active" className="cursor-pointer">
                Active
              </Label>
              <Switch
                id="coupon-active"
                data-ocid="admin_coupon_active_switch"
                checked={form.active}
                onCheckedChange={(checked) => updateField("active", checked)}
              />
            </div>

            {formError ? (
              <p
                data-ocid="admin_coupon_form_error"
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="admin_coupon_cancel_button"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="admin_coupon_save_button"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving…"
                  : editingId !== null
                    ? "Save changes"
                    : "Add coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminQueryState>
  );
}

export function AdminCouponsPage() {
  return (
    <Layout title="Manage coupons">
      <AdminGuard>
        <CouponsContent />
      </AdminGuard>
    </Layout>
  );
}
