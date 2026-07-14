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
}

export function ConsultationForm() {
  const [state, setState] = useState<SubmissionState>({ kind: 'idle', message: '' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: 'submitting', message: 'Submitting consultation request…' });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      firmSlug: process.env.NEXT_PUBLIC_FIRM_SLUG ?? 'batalla-associates',
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      requestedDate: formData.get('requestedDate'),
      requestedTimeWindow: formData.get('requestedTimeWindow'),
      consultationMode: formData.get('consultationMode'),
      notes: formData.get('notes'),
      consent: formData.get('consent') === 'on',
      website: formData.get('website'),
    };

    try {
      const response = await fetch('/api/public/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? 'The request could not be submitted.');
      }

      form.reset();
      setState({
        kind: 'success',
        message: 'Your request was received. The requested slot is not confirmed until the office contacts you.',
      });
    } catch (error) {
      setState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'The request could not be submitted.',
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
        <Field label="Preferred date" htmlFor="requestedDate">
          <Input id="requestedDate" name="requestedDate" type="date" required />
        </Field>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Time window" htmlFor="requestedTimeWindow">
          <select
            id="requestedTimeWindow"
            name="requestedTimeWindow"
            defaultValue="morning"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </Field>
        <Field label="Consultation mode" htmlFor="consultationMode">
          <select
            id="consultationMode"
            name="consultationMode"
            defaultValue="office"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="office">Office</option>
            <option value="video">Video</option>
            <option value="phone">Telephone</option>
          </select>
        </Field>
      </div>
      <Field label="Brief notes (optional)" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={6} maxLength={2000} />
      </Field>

      <div className="absolute left-[-9999px]" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 accent-zinc-900" />
        <span>
          I consent to the office using this information to review and respond to the scheduling request. I
          understand that the requested date is not confirmed and no attorney-client relationship is created.
        </span>
      </label>

      {state.kind !== 'idle' ? (
        <div
          role="status"
          className={
            state.kind === 'error'
              ? 'border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive'
              : state.kind === 'success'
                ? 'border border-emerald-700/30 bg-emerald-700/5 p-4 text-sm text-emerald-800'
                : 'border border-border bg-muted/50 p-4 text-sm text-muted-foreground'
          }
        >
          {state.message}
        </div>
      ) : null}

      <Button type="submit" size="lg" className="rounded-none" disabled={state.kind === 'submitting'}>
        {state.kind === 'submitting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Request consultation
      </Button>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
