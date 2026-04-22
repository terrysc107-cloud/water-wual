"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useClarix } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { FormField, FieldError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(4, "Use at least 4 characters."),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { login } = useClarix();
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "avery@clarix.demo",
      password: "clarix",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    login(values.email);
    router.push("/dashboard");
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <FormField label="Email">
        <Input
          type="email"
          placeholder="name@clarix.io"
          {...form.register("email")}
        />
        <FieldError message={form.formState.errors.email?.message} />
      </FormField>
      <FormField label="Password">
        <Input
          type="password"
          placeholder="••••••••"
          {...form.register("password")}
        />
        <FieldError message={form.formState.errors.password?.message} />
      </FormField>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="font-medium text-primary"
          onClick={() =>
            form.reset({ email: "avery@clarix.demo", password: "clarix" })
          }
        >
          Use demo credentials
        </button>
        <span className="text-slate-500">Forgot password</span>
      </div>
      <Button type="submit" className="w-full" size="lg">
        Sign in
      </Button>
    </form>
  );
}
