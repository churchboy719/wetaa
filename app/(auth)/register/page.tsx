"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
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
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Registration failed."
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
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold">
          Create your account
        </h1>

        <p className="mb-8 text-gray-600">
          Create an account to get started with Wetaa.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First name"
              value={form.firstName}
              onChange={(event) =>
                updateField(
                  "firstName",
                  event.target.value
                )
              }
              required
              className="rounded border p-3"
            />

            <input
              type="text"
              placeholder="Last name"
              value={form.lastName}
              onChange={(event) =>
                updateField(
                  "lastName",
                  event.target.value
                )
              }
              required
              className="rounded border p-3"
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value
              )
            }
            required
            className="w-full rounded border p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) =>
              updateField(
                "password",
                event.target.value
              )
            }
            required
            minLength={8}
            className="w-full rounded border p-3"
          />

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
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-black underline"
          >
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}