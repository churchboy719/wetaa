"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBusinessPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    businessName: "",
    description: "",
    locationName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Germany",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/businesses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.businessName,
            description: form.description,
            location: {
              name: form.locationName,
              address: form.address,
              city: form.city,
              postalCode: form.postalCode,
              country: form.country,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Business creation failed."
        );
        return;
      }

      router.push("/customer");
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Create your business
        </h1>

        <p className="mt-2 text-gray-600">
          Set up your business and your first
          location.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Business
          </h2>

          <input
            type="text"
            placeholder="Business name"
            value={form.businessName}
            onChange={(event) =>
              updateField(
                "businessName",
                event.target.value
              )
            }
            required
            className="w-full rounded border p-3"
          />

          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            rows={4}
            className="w-full rounded border p-3"
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            First location
          </h2>

          <input
            type="text"
            placeholder="Location name"
            value={form.locationName}
            onChange={(event) =>
              updateField(
                "locationName",
                event.target.value
              )
            }
            required
            className="w-full rounded border p-3"
          />

          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(event) =>
              updateField(
                "address",
                event.target.value
              )
            }
            className="w-full rounded border p-3"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={(event) =>
                updateField(
                  "city",
                  event.target.value
                )
              }
              className="rounded border p-3"
            />

            <input
              type="text"
              placeholder="Postal code"
              value={form.postalCode}
              onChange={(event) =>
                updateField(
                  "postalCode",
                  event.target.value
                )
              }
              className="rounded border p-3"
            />
          </div>

          <input
            type="text"
            placeholder="Country"
            value={form.country}
            onChange={(event) =>
              updateField(
                "country",
                event.target.value
              )
            }
            className="w-full rounded border p-3"
          />
        </section>

        {error && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {loading
            ? "Creating business..."
            : "Create business"}
        </button>
      </form>
    </main>
  );
}