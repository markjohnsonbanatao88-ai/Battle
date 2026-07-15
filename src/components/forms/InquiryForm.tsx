'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SubmissionState {
  kind: 'idle' | 'submitting' | 'success' | 'error';
  message: string;
  publicReference?: string;
}

const initialState: SubmissionState = { kind: 'idle', message: '' };

export function InquiryForm() {
  const [state, setState] = useState<SubmissionState>(initialState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: 'submitting', message: 'Submitting inquiry…' });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      firmSlug: process.env.NEXT_PUBLIC_FIRM_SLUG ?? 'batalla-associates',
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      preferredContact: formData.get('preferredContact'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      consent: formData.get('consent') === 'on',
      website: formData.get('website'),
    };

    try {
      const response = await fetch('/api/public/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string; publicReference?: string };

      if (!response.ok) {
        throw new Error(result.message ?? 'The inquiry could not be submitted.');
      }

      form.reset();
      setState({
        kind: 'success',
        publicReference: result.publicReference,
        message:
          'Your inquiry was received for office review. This acknowledgment does not create an attorney-client relationship.',
      });
    } catch (error) {
      setState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'The inquiry could not be submitted.',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Full name" htmlFor="fullName">
          <Input id="fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={150} />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required maxLength={254} />
        </Field>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Telephone (optional)" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </Field>
        <Field label="Preferred contact" htmlFor="preferredContact">
          <select
            id="preferredContact"
            name="preferredContact"
            defaultValue="email"
            className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-base"
          >
            <option value="email">Email</option>
            <option value="phone">Telephone</option>
          </select>
        </Field>
      </div>
      <Field label="Subject" htmlFor="subject">
        <Input id="subject" name="subject" required minLength={3} maxLength={200} />
      </Field>
      <Field label="Short factual summary" htmlFor="message">
        <Textarea
          id="message"
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={8}
          placeholder="Identify the people or organizations involved and summarize the concern. Do not upload evidence or include unnecessary sensitive information."
        />
      </Field>

      <div className="absolute left-[-9999px]" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-base leading-7 text-muted-foreground">
        <input name="consent" type="checkbox" required className="mt-1 h-5 w-5 accent-zinc-900" />
        <span>
          I consent to the office using this information to review the inquiry, conduct conflict screening,
          and contact me. I understand that submission does not create an attorney-client relationship.
        </span>
      </label>

      {state.kind !== 'idle' ? (
        <div
          role="status"
          className={
            state.kind === 'error'
              ? 'border border-destructive/40 bg-destructive/5 p-5 text-base text-destructive'
              : state.kind === 'success'
                ? 'border border-emerald-700/30 bg-emerald-700/5 p-5 text-base text-emerald-900'
                : 'border border-border bg-muted/50 p-5 text-base text-muted-foreground'
          }
        >
          <p>{state.message}</p>
          {state.publicReference ? (
            <div className="mt-4 border-t border-current/20 pt-4">
              <p className="font-semibold">Your reference number</p>
              <p className="mt-1 font-mono text-xl tracking-wide" data-testid="public-reference">
                {state.publicReference}
              </p>
              <p className="mt-2 text-sm">Keep this number when contacting the office.</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" size="lg" className="min-h-12 rounded-none px-7 text-base" disabled={state.kind === 'submitting'}>
        {state.kind === 'submitting' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        Submit inquiry
      </Button>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-base">
        {label}
      </Label>
      {children}
    </div>
  );
}
