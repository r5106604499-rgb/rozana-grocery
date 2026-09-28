import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddAddress,
  useAddresses,
  useDeleteAddress,
  useUpdateAddress,
} from "@/hooks/useAddress";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { type Address, EMPTY_ADDRESS, type SavedAddress } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { LogIn, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

type FieldErrors = Partial<Record<keyof Address, string>>;

const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const PINCODE_PATTERN = /^\d{6}$/;

/** Validate an address draft and return per-field messages. */
function validateAddress(draft: Address): FieldErrors {
  const errors: FieldErrors = {};
  if (!draft.fullName.trim()) errors.fullName = "Enter the recipient's name.";
  if (!draft.mobile.trim()) {
    errors.mobile = "Enter a 10-digit mobile number.";
  } else if (!MOBILE_PATTERN.test(draft.mobile.trim())) {
    errors.mobile = "Enter a valid 10-digit mobile number.";
  }
  if (!draft.houseFlat.trim()) {
    errors.houseFlat = "Enter your house or flat number.";
  }
  if (!draft.area.trim()) errors.area = "Enter your area or locality.";
  if (!draft.pincode.trim()) {
    errors.pincode = "Enter a 6-digit pincode.";
  } else if (!PINCODE_PATTERN.test(draft.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode.";
  }
  return errors;
}

interface AddressFormProps {
  initial: Address;
  submitLabel: string;
  busy: boolean;
  errorMessage?: string;
  onSubmit: (address: Address) => void;
  onCancel: () => void;
}

/** Add / edit address form with inline validation. */
function AddressForm({
  initial,
  submitLabel,
  busy,
  errorMessage,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const [draft, setDraft] = useState<Address>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});

  const update = (field: keyof Address, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateAddress(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      fullName: draft.fullName.trim(),
      mobile: draft.mobile.trim(),
      houseFlat: draft.houseFlat.trim(),
      area: draft.area.trim(),
      landmark: draft.landmark.trim(),
      pincode: draft.pincode.trim(),
      instructions: draft.instructions.trim(),
    });
  };

  return (
    <form
      data-ocid="address_form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold text-foreground">
          {submitLabel === "Save address"
            ? "Add a new address"
            : "Edit address"}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close form"
          data-ocid="address_form_close_button"
          onClick={onCancel}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <Field
        id="address-full-name"
        label="Full name"
        value={draft.fullName}
        error={errors.fullName}
        autoComplete="name"
        placeholder="e.g. Priya Sharma"
        onChange={(value) => update("fullName", value)}
      />
      <Field
        id="address-mobile"
        label="Mobile number"
        value={draft.mobile}
        error={errors.mobile}
        inputMode="numeric"
        autoComplete="tel"
        maxLength={10}
        placeholder="10-digit mobile number"
        onChange={(value) => update("mobile", value.replace(/\D/g, ""))}
      />
      <Field
        id="address-house"
        label="House / flat"
        value={draft.houseFlat}
        error={errors.houseFlat}
        placeholder="Flat 402, Sunrise Apartments"
        onChange={(value) => update("houseFlat", value)}
      />
      <Field
        id="address-area"
        label="Area / locality"
        value={draft.area}
        error={errors.area}
        placeholder="Andheri West"
        onChange={(value) => update("area", value)}
      />
      <Field
        id="address-pincode"
        label="Pincode"
        value={draft.pincode}
        error={errors.pincode}
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={6}
        placeholder="6-digit pincode"
        onChange={(value) => update("pincode", value.replace(/\D/g, ""))}
      />
      <Field
        id="address-landmark"
        label="Landmark (optional)"
        value={draft.landmark}
        placeholder="Near City Mall"
        onChange={(value) => update("landmark", value)}
      />

      <div className="space-y-1.5">
        <Label htmlFor="address-instructions">
          Delivery instructions (optional)
        </Label>
        <Textarea
          id="address-instructions"
          data-ocid="address_instructions_input"
          value={draft.instructions}
          onChange={(event) => update("instructions", event.target.value)}
          placeholder="e.g. Ring the bell twice, leave at the door"
          rows={2}
          maxLength={200}
        />
      </div>

      {errorMessage ? (
        <p
          data-ocid="address_form_error"
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          data-ocid="address_cancel_button"
          onClick={onCancel}
          className="flex-1 rounded-full"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          data-ocid="address_submit_button"
          disabled={busy}
          className="flex-1 rounded-full"
        >
          {busy ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel";
  autoComplete?: string;
  maxLength?: number;
  onChange: (value: string) => void;
}

/** Labelled text input with an inline validation message. */
function Field({
  id,
  label,
  value,
  error,
  placeholder,
  inputMode,
  autoComplete,
  maxLength,
  onChange,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        data-ocid={`${id}_input`}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p
          id={`${id}-error`}
          data-ocid={`${id}_error`}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** One saved address card with edit and delete actions. */
function AddressCard({
  saved,
  busy,
  onEdit,
  onDelete,
}: {
  saved: SavedAddress;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { address } = saved;
  return (
    <article
      data-ocid="address_item"
      className="rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {address.fullName}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {[address.houseFlat, address.area, address.landmark]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pincode {address.pincode} · {address.mobile}
          </p>
          {address.instructions ? (
            <p className="mt-1 text-xs italic text-muted-foreground">
              “{address.instructions}”
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex gap-2 border-t border-border pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid="address_edit_button"
          disabled={busy}
          onClick={onEdit}
          className="flex-1 gap-1.5 rounded-full"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid="address_delete_button"
          disabled={busy}
          onClick={onDelete}
          className="flex-1 gap-1.5 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </article>
  );
}

/** Saved delivery addresses with add, edit and delete. */
export function AddressesPage() {
  const { isAuthenticated, isInitializing, login, isLoggingIn } = useAuth();
  const addressesQuery = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [formMode, setFormMode] = useState<"closed" | "add" | "edit">("closed");
  const [editing, setEditing] = useState<SavedAddress | null>(null);

  const addresses = addressesQuery.data ?? [];
  const busy =
    addAddress.isPending || updateAddress.isPending || deleteAddress.isPending;

  const closeForm = () => {
    setFormMode("closed");
    setEditing(null);
  };

  const handleAdd = (address: Address) => {
    addAddress.mutate(address, { onSuccess: closeForm });
  };

  const handleUpdate = (address: Address) => {
    if (!editing) return;
    updateAddress.mutate(
      { addressId: editing.id, address },
      { onSuccess: closeForm },
    );
  };

  if (isInitializing) {
    return (
      <Layout title="Saved Addresses">
        <LoadingState rows={3} />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout title="Saved Addresses">
        <EmptyState
          icon={LogIn}
          title="Sign in to save addresses"
          message="Log in with Internet Identity to add and manage your delivery addresses."
        >
          <Button
            type="button"
            data-ocid="addresses_login_button"
            disabled={isLoggingIn}
            onClick={() => void login()}
            className="mt-1 gap-2 rounded-full"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {isLoggingIn ? "Signing in…" : "Sign in"}
          </Button>
        </EmptyState>
      </Layout>
    );
  }

  if (addressesQuery.isError) {
    return (
      <Layout title="Saved Addresses">
        <ErrorState
          title="Couldn't load your addresses"
          message="We couldn't fetch your saved addresses. Please try again."
          onRetry={() => void addressesQuery.refetch()}
        />
      </Layout>
    );
  }

  const formError =
    addAddress.isError || updateAddress.isError
      ? "We couldn't save this address. Please try again."
      : undefined;

  return (
    <Layout title="Saved Addresses">
      <div data-ocid="addresses_page" className="space-y-4">
        {formMode === "closed" ? (
          <Button
            type="button"
            data-ocid="address_add_button"
            onClick={() => {
              setEditing(null);
              setFormMode("add");
            }}
            className="w-full gap-2 rounded-full"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add new address
          </Button>
        ) : null}

        {formMode === "add" ? (
          <AddressForm
            initial={EMPTY_ADDRESS}
            submitLabel="Save address"
            busy={addAddress.isPending}
            errorMessage={formError}
            onSubmit={handleAdd}
            onCancel={closeForm}
          />
        ) : null}

        {formMode === "edit" && editing ? (
          <AddressForm
            initial={editing.address}
            submitLabel="Update address"
            busy={updateAddress.isPending}
            errorMessage={formError}
            onSubmit={handleUpdate}
            onCancel={closeForm}
          />
        ) : null}

        {addressesQuery.isLoading ? (
          <LoadingState rows={2} />
        ) : addresses.length === 0 && formMode === "closed" ? (
          <EmptyState
            icon={MapPin}
            title="No saved addresses"
            message="Add a delivery address to speed up checkout."
          />
        ) : (
          <div data-ocid="addresses_list" className="space-y-3">
            {addresses.map((saved) => (
              <AddressCard
                key={saved.id.toString()}
                saved={saved}
                busy={busy}
                onEdit={() => {
                  setEditing(saved);
                  setFormMode("edit");
                }}
                onDelete={() => deleteAddress.mutate(saved.id)}
              />
            ))}
          </div>
        )}

        {deleteAddress.isError ? (
          <p
            data-ocid="address_delete_error"
            role="alert"
            className={cn("text-center text-xs font-medium text-destructive")}
          >
            We couldn&apos;t delete that address. Please try again.
          </p>
        ) : null}

        <p className="text-center text-xs text-muted-foreground">
          Need to change something?{" "}
          <Link
            to="/help"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Visit Help &amp; Support
          </Link>
        </p>
      </div>
    </Layout>
  );
}
