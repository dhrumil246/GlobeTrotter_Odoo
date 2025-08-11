"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { loginAction, signupAction, type ActionResult } from "../(auth)/actions";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2),
});

type Props = { mode: "login" | "signup" };

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (s, fd) => loginAction(s, fd),
    null
  );
  const form = useForm<LoginValues>({ 
    resolver: zodResolver(loginSchema), 
    defaultValues: { email: "", password: "" } 
  });
  
  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <input 
          type="email" 
          className="w-full rounded-xl bg-black-100 border-0 px-6 py-4 text-lg placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:bg-black transition-all" 
          placeholder="Email" 
          {...form.register("email")} 
        />
        <p className="text-xs text-red-600">{form.formState.errors.email?.message}</p>
      </div>
      <div className="space-y-2">
        <input 
          type="password" 
          className="w-full rounded-xl bg-black-100 border-0 px-6 py-4 text-lg placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:bg-black transition-all" 
          placeholder="Password" 
          {...form.register("password")} 
        />
        <p className="text-xs text-red-600">{form.formState.errors.password?.message}</p>
      </div>
      {state?.success === false && <div className="text-sm text-red-600">{state.message}</div>}
      
      <div className="pt-8">
        <button 
          type="submit" 
          disabled={pending} 
          className="w-16 h-16 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {pending ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}

function SignupForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (s, fd) => signupAction(s, fd),
    null
  );
  const form = useForm<SignupValues>({ 
    resolver: zodResolver(signupSchema), 
    defaultValues: { name: "", email: "", password: "" } 
  });
  
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <input type="text" className="w-full rounded-md border px-3 py-2" placeholder="Your name" {...form.register("name")} />
        <p className="text-xs text-red-600">{form.formState.errors.name?.message}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input type="email" className="w-full rounded-md border px-3 py-2" placeholder="you@example.com" {...form.register("email")} />
        <p className="text-xs text-red-600">{form.formState.errors.email?.message}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <input type="password" className="w-full rounded-md border px-3 py-2" placeholder="••••••••" {...form.register("password")} />
        <p className="text-xs text-red-600">{form.formState.errors.password?.message}</p>
      </div>
      {state?.success === false && <div className="text-sm text-red-600">{state.message}</div>}
      <button type="submit" disabled={pending} className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-white hover:opacity-90 disabled:opacity-50">{pending ? "Please wait..." : "Sign up"}</button>
    </form>
  );
}

export function AuthForm({ mode }: Props) {
  return mode === "login" ? <LoginForm /> : <SignupForm />;
}