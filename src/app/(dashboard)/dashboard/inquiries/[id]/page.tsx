import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock3, FileText, Scale, Users } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { PrintButton } from '@/components/dashboard/PrintButton';
import { requireFirmContext } from '@/lib/auth/current-firm';
import { createClient } from '@/lib/supabase/server';
import type {
  ConflictCandidateRow,
  ConflictDecisionRow,
  InquiryRow,
  IntakePartyRow,
  IntakeRow,
  MembershipRole,
} from '@/types/domain';
import {
  addPartyAction,
  recordDecisionAction,
  reviewCandidateAction,
  runConflictCheckAction,
  startIntakeAction,
} from './actions';
import { createScheduledConsultationAction } from './schedule-actions';

interface ConflictCheckRow {
  id: string;
  intake_id: string;
  status: 'draft' | 'searching' | 'review_required' | 'decision_recorded' | 'superseded';
  search_version: number;
  requested_at: string;
  completed_at: string | null;
}

interface LawyerOption {
  user_id: string;
  display_name: string;
  role: MembershipRole;
}

interface ConsultationView {
  id: string;
  inquiry_id: string | null;
  requested_date: string;
  requested_time_window: string;
  consultation_mode: 'office' | 'video' | 'phone';
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'declined';
  scheduled_start: string | null;
  scheduled_end: string | null;
  assigned_to: string | null;
  notes: string | null;
}

const lawyerRoles: MembershipRole[] = ['firm_admin', 'managing_partner', 'partner', 'associate'];

export default async function InquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; kind?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const context = await requireFirmContext();
  const supabase = await createClient();

  const { data: inquiryData, error: inquiryError } = await supabase
    .from('inquiries')
    .select(
      'id, firm_id, public_reference, internal_reference, full_name, email, phone, preferred_contact, subject, message, source, campaign, status, assigned_to, row_version, created_at',
    )
    .eq('id', id)
    .eq('firm_id', context.firm.id)
    .maybeSingle();

  if (inquiryError || !inquiryData) notFound();
  const inquiry = inquiryData as InquiryRow;

  const { data: intakeData, error: intakeError } = await supabase
    .from('intakes')
    .select(
      'id, firm_id, inquiry_id, status, urgency, summary, jurisdiction, missing_information, owner_user_id, row_version, created_at, updated_at',
    )
    .eq('inquiry_id', inquiry.id)
    .maybeSingle();
  const intake = (intakeData ?? null) as IntakeRow | null;

  let parties: IntakePartyRow[] = [];
  let conflictCheck: ConflictCheckRow | null = null;
  let candidates: ConflictCandidateRow[] = [];
  let decisions: ConflictDecisionRow[] = [];

  if (intake) {
    const [partyResult, checkResult, decisionResult] = await Promise.all([
      supabase
        .from('intake_parties')
        .select('id, firm_id, intake_id, party_type, display_name, party_role, is_adverse, aliases, relationship_note, created_at')
        .eq('intake_id', intake.id)
        .order('is_adverse', { ascending: true })
        .order('created_at', { ascending: true }),
      supabase
        .from('conflict_checks')
        .select('id, intake_id, status, search_version, requested_at, completed_at')
        .eq('intake_id', intake.id)
        .order('search_version', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('conflict_decisions')
        .select('id, intake_id, conflict_check_id, decision_version, disposition, reasoning, conditions, decided_by, decided_at')
        .eq('intake_id', intake.id)
        .order('decision_version', { ascending: false }),
    ]);

    parties = (partyResult.data ?? []) as IntakePartyRow[];
    conflictCheck = (checkResult.data ?? null) as ConflictCheckRow | null;
    decisions = (decisionResult.data ?? []) as ConflictDecisionRow[];

    if (conflictCheck) {
      const { data } = await supabase
        .from('conflict_candidates')
        .select(
          'id, conflict_check_id, matched_source, matched_display_name, match_reason, match_score, review_status, reviewer_reason, reviewed_at',
        )
        .eq('conflict_check_id', conflictCheck.id)
        .order('match_score', { ascending: false })
        .order('created_at', { ascending: true });
      candidates = (data ?? []) as ConflictCandidateRow[];
    }
  }

  const [{ data: consultationData }, { data: lawyerData }] = await Promise.all([
    supabase
      .from('consultation_requests')
      .select(
        'id, inquiry_id, requested_date, requested_time_window, consultation_mode, status, scheduled_start, scheduled_end, assigned_to, notes',
      )
      .eq('firm_id', context.firm.id)
      .eq('email', inquiry.email)
      .order('created_at', { ascending: false }),
    supabase.rpc('list_active_lawyers_for_scheduling', { p_firm_id: context.firm.id }),
  ]);

  const consultations = (consultationData ?? []) as ConsultationView[];
  const lawyers = (lawyerData ?? []) as LawyerOption[];
  const latestDecision = decisions[0] ?? null;
  const canMakeLegalDecision = lawyerRoles.includes(context.membership.role);
  const hasAdverseParty = parties.some((party) => party.is_adverse);
  const unreviewedCount = candidates.filter((candidate) => candidate.review_status === 'unreviewed').length;
  const canSchedule = latestDecision?.disposition === 'cleared' || latestDecision?.disposition === 'conditional';

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          eyebrow="Prospective client"
          title={inquiry.full_name}
          description="Follow the steps in order. No consultation or legal engagement may bypass the conflict decision."
        />
      </div>

      <div className="hidden border-b-2 border-black pb-4 print:block">
        <p className="text-sm font-bold uppercase">Confidential — prospective client review</p>
        <h1 className="mt-2 text-2xl font-bold">Batalla & Associates Intake and Conflict Review Packet</h1>
        <p className="mt-2">Internal reference: {inquiry.internal_reference}</p>
        <p>Printed: {new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/inquiries" className="inline-flex min-h-12 items-center rounded-md border border-border px-5 text-base font-semibold">
          Back to inquiry list
        </Link>
        <PrintButton label="Print intake packet" />
      </div>

      {query.notice ? (
        <div
          role="status"
          className={
            query.kind === 'error'
              ? 'mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-5 text-base text-destructive print:hidden'
              : 'mb-6 rounded-md border border-emerald-700/30 bg-emerald-700/10 p-5 text-base text-emerald-900 print:hidden'
          }
        >
          {query.notice}
        </div>
      ) : null}

      {intakeError ? (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-5 text-base text-destructive">
          The structured intake could not be loaded. The original inquiry remains safe. Ask the office administrator to check the database migration.
        </div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Panel title="Original inquiry" icon={<FileText className="h-5 w-5" />}>
          <Definition label="Internal office number" value={inquiry.internal_reference} strong />
          <Definition label="Public reference" value={inquiry.public_reference} />
          <Definition label="Received" value={new Date(inquiry.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} />
          <Definition label="Email" value={inquiry.email} />
          <Definition label="Telephone" value={inquiry.phone ?? 'Not provided'} />
          <Definition label="Preferred contact" value={inquiry.preferred_contact === 'phone' ? 'Telephone' : 'Email'} />
          <Definition label="Subject" value={inquiry.subject} />
          <div className="mt-5 rounded-md border border-border bg-background p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Original factual summary — preserved</p>
            <p className="mt-3 whitespace-pre-wrap text-base leading-7">{inquiry.message}</p>
          </div>
        </Panel>

        <aside className="rounded-lg border-2 border-primary bg-card p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Current office status</p>
          <p className="mt-3 text-2xl font-bold capitalize">{(intake?.status ?? inquiry.status).replaceAll('_', ' ')}</p>
          <p className="mt-4 text-base leading-7">
            {nextActionText(intake, latestDecision, unreviewedCount)}
          </p>
          <div className="mt-5 border-t border-border pt-5 text-sm leading-6">
            <p><span className="font-semibold">Owner:</span> {intake?.owner_user_id ? 'Assigned office staff' : 'Not yet assigned'}</p>
            <p><span className="font-semibold">Urgency:</span> {intake?.urgency ?? 'Not yet assessed'}</p>
            <p><span className="font-semibold">Your role:</span> {context.membership.role.replaceAll('_', ' ')}</p>
          </div>
        </aside>
      </section>

      {!intake ? (
        <Panel title="Step 1 — Start staff review" icon={<Clock3 className="h-5 w-5" />} className="mt-6 print:hidden">
          <p className="mb-5 text-base leading-7 text-muted-foreground">
            This copies the original submission into a structured office intake. The original text remains unchanged.
          </p>
          <form action={startIntakeAction} className="grid gap-5 lg:grid-cols-2">
            <input type="hidden" name="inquiryId" value={inquiry.id} />
            <Field label="Urgency">
              <select name="urgency" defaultValue="normal" className={inputClass}>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical — immediate staff attention</option>
              </select>
            </Field>
            <Field label="Jurisdiction or location, if known">
              <input name="jurisdiction" maxLength={240} className={inputClass} />
            </Field>
            <div className="lg:col-span-2">
              <Field label="Information still needed">
                <textarea name="missingInformation" rows={4} maxLength={2000} className={inputClass} />
              </Field>
            </div>
            <button className={primaryButtonClass}>Start staff review</button>
          </form>
        </Panel>
      ) : (
        <>
          <Panel title="Step 2 — People and organizations involved" icon={<Users className="h-5 w-5" />} className="mt-6">
            <p className="text-base leading-7 text-muted-foreground print:hidden">
              Record every prospective client, opposing party, company, alias and related person. The conflict search is only as complete as this list.
            </p>
            <div className="mt-5 grid gap-4">
              {parties.map((party) => (
                <article key={party.id} className={`rounded-md border p-5 ${party.is_adverse ? 'border-amber-600 bg-amber-50/60' : 'border-border bg-background'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">{party.display_name}</h3>
                      <p className="mt-1 capitalize text-muted-foreground">{party.party_role.replaceAll('_', ' ')} · {party.party_type}</p>
                    </div>
                    <span className="rounded-full border px-3 py-1 text-sm font-semibold">
                      {party.is_adverse ? 'Opposing / adverse' : 'Client / related'}
                    </span>
                  </div>
                  {party.aliases.length ? <p className="mt-3 text-sm"><span className="font-semibold">Also known as:</span> {party.aliases.join(', ')}</p> : null}
                  {party.relationship_note ? <p className="mt-2 text-sm"><span className="font-semibold">Relationship:</span> {party.relationship_note}</p> : null}
                </article>
              ))}
            </div>

            <form action={addPartyAction} className="mt-6 grid gap-5 rounded-md border border-border bg-muted/20 p-5 print:hidden lg:grid-cols-2">
              <input type="hidden" name="inquiryId" value={inquiry.id} />
              <input type="hidden" name="intakeId" value={intake.id} />
              <div className="lg:col-span-2"><h3 className="text-xl font-semibold">Add another person or organization</h3></div>
              <Field label="Person or organization name"><input name="displayName" required minLength={2} maxLength={240} className={inputClass} /></Field>
              <Field label="Type">
                <select name="partyType" defaultValue="person" className={inputClass}>
                  <option value="person">Person</option><option value="organization">Company or organization</option>
                </select>
              </Field>
              <Field label="Role in the concern"><input name="partyRole" required placeholder="Example: opposing party, spouse, company" maxLength={100} className={inputClass} /></Field>
              <Field label="Other names or aliases, separated by commas"><input name="aliases" maxLength={1000} className={inputClass} /></Field>
              <div className="lg:col-span-2"><Field label="Relationship note"><textarea name="relationshipNote" rows={3} maxLength={1000} className={inputClass} /></Field></div>
              <label className="flex min-h-12 items-center gap-3 text-base font-semibold">
                <input type="checkbox" name="isAdverse" className="h-5 w-5" /> This is an opposing or adverse party
              </label>
              <button className={primaryButtonClass}>Save party</button>
            </form>

            <form action={runConflictCheckAction} className="mt-6 rounded-md border-2 border-primary/30 bg-primary/5 p-5 print:hidden">
              <input type="hidden" name="inquiryId" value={inquiry.id} />
              <input type="hidden" name="intakeId" value={intake.id} />
              <h3 className="text-xl font-semibold">Ready for conflict search?</h3>
              <p className="mt-2 text-base leading-7">
                {hasAdverseParty
                  ? 'Review the party list above, then run the search. The system only creates warnings; a lawyer must make the decision.'
                  : 'Add at least one opposing or adverse party before running the conflict search.'}
              </p>
              <button disabled={!hasAdverseParty} className={`${primaryButtonClass} mt-4 disabled:cursor-not-allowed disabled:opacity-50`}>
                Run conflict search
              </button>
            </form>
          </Panel>

          {conflictCheck ? (
            <Panel title="Step 3 — Conflict warnings" icon={<AlertTriangle className="h-5 w-5" />} className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-base">Search version {conflictCheck.search_version} · <span className="font-semibold capitalize">{conflictCheck.status.replaceAll('_', ' ')}</span></p>
                <p className="text-sm text-muted-foreground">Warnings do not equal a legal conflict.</p>
              </div>

              {candidates.length === 0 ? (
                <div className="mt-5 rounded-md border border-emerald-700/30 bg-emerald-50 p-5">
                  <p className="font-semibold">No exact historical name matches were found.</p>
                  <p className="mt-2 text-sm">A lawyer must still review the party list and record the overall decision.</p>
                </div>
              ) : (
                <div className="mt-5 grid gap-4">
                  {candidates.map((candidate) => (
                    <article key={candidate.id} className="rounded-md border border-amber-600 bg-amber-50/60 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold">{candidate.matched_display_name}</h3>
                          <p className="mt-1 text-sm capitalize">Source: {candidate.matched_source.replaceAll('_', ' ')}</p>
                        </div>
                        <span className="rounded-full border border-amber-700 px-3 py-1 text-sm font-semibold capitalize">
                          {candidate.review_status.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-4 text-base font-semibold">Why it appeared</p>
                      <p className="mt-1 text-base leading-7">{candidate.match_reason}</p>
                      {candidate.reviewer_reason ? <p className="mt-3 border-t border-amber-700/20 pt-3 text-sm"><span className="font-semibold">Lawyer note:</span> {candidate.reviewer_reason}</p> : null}

                      {canMakeLegalDecision && candidate.review_status === 'unreviewed' ? (
                        <form action={reviewCandidateAction} className="mt-5 grid gap-4 border-t border-amber-700/20 pt-5 print:hidden lg:grid-cols-[240px_1fr_auto]">
                          <input type="hidden" name="inquiryId" value={inquiry.id} />
                          <input type="hidden" name="candidateId" value={candidate.id} />
                          <select name="reviewStatus" defaultValue="not_relevant" className={inputClass}>
                            <option value="not_relevant">Not relevant</option>
                            <option value="potential">Potential conflict</option>
                            <option value="confirmed">Confirmed conflict</option>
                            <option value="needs_more_information">Need more information</option>
                          </select>
                          <input name="reason" required minLength={5} maxLength={2000} placeholder="Write the lawyer's reason" className={inputClass} />
                          <button className={secondaryButtonClass}>Record review</button>
                        </form>
                      ) : !canMakeLegalDecision && candidate.review_status === 'unreviewed' ? (
                        <p className="mt-4 font-semibold text-amber-900 print:hidden">Waiting for an authorized lawyer to review this warning.</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}

              {canMakeLegalDecision && conflictCheck.status === 'review_required' ? (
                <form action={recordDecisionAction} className="mt-6 rounded-md border-2 border-primary bg-card p-6 print:hidden">
                  <input type="hidden" name="inquiryId" value={inquiry.id} />
                  <input type="hidden" name="intakeId" value={intake.id} />
                  <h3 className="text-xl font-semibold">Lawyer’s overall conflict decision</h3>
                  {unreviewedCount > 0 ? (
                    <p className="mt-3 rounded-md border border-amber-600 bg-amber-50 p-4 font-semibold text-amber-950">
                      Review all {unreviewedCount} remaining warning{unreviewedCount === 1 ? '' : 's'} before recording the overall decision.
                    </p>
                  ) : null}
                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <Field label="Decision">
                      <select name="disposition" defaultValue="cleared" className={inputClass}>
                        <option value="cleared">Cleared</option>
                        <option value="conditional">Cleared with conditions</option>
                        <option value="conflicted">Conflict confirmed — do not proceed</option>
                        <option value="deferred">Deferred — more information required</option>
                      </select>
                    </Field>
                    <Field label="Conditions, when applicable"><textarea name="conditions" rows={3} maxLength={4000} className={inputClass} /></Field>
                    <div className="lg:col-span-2"><Field label="Written legal reasoning"><textarea name="reasoning" required minLength={10} maxLength={4000} rows={5} className={inputClass} /></Field></div>
                  </div>
                  <button disabled={unreviewedCount > 0} className={`${primaryButtonClass} mt-5 disabled:cursor-not-allowed disabled:opacity-50`}>
                    Permanently record lawyer decision
                  </button>
                  <p className="mt-3 text-sm text-muted-foreground">This decision cannot be edited or deleted. A later change requires a new search and a new decision version.</p>
                </form>
              ) : null}
            </Panel>
          ) : null}

          {decisions.length > 0 ? (
            <Panel title="Permanent conflict decision history" icon={<Scale className="h-5 w-5" />} className="mt-6">
              <div className="grid gap-4">
                {decisions.map((decision) => (
                  <article key={decision.id} className="rounded-md border border-border bg-background p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-semibold capitalize">Version {decision.decision_version}: {decision.disposition.replaceAll('_', ' ')}</h3>
                      <span className="text-sm text-muted-foreground">{new Date(decision.decided_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</span>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-base leading-7">{decision.reasoning}</p>
                    {decision.conditions ? <p className="mt-3 rounded-md border border-border bg-muted/30 p-4"><span className="font-semibold">Conditions:</span> {decision.conditions}</p> : null}
                  </article>
                ))}
              </div>
            </Panel>
          ) : null}

          <Panel title="Step 4 — Consultation" icon={<CheckCircle2 className="h-5 w-5" />} className="mt-6">
            {!canSchedule ? (
              <div className="rounded-md border border-amber-600 bg-amber-50 p-5">
                <p className="text-lg font-semibold">Scheduling is locked.</p>
                <p className="mt-2 text-base leading-7">An authorized lawyer must first record a cleared or conditionally cleared conflict decision.</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border border-emerald-700/30 bg-emerald-50 p-5">
                  <p className="text-lg font-semibold">Conflict gate passed.</p>
                  <p className="mt-2 text-base">Staff may now reserve a lawyer and consultation time.</p>
                </div>
                <form action={createScheduledConsultationAction} className="mt-6 grid gap-5 rounded-md border border-border bg-muted/20 p-5 print:hidden lg:grid-cols-2">
                  <input type="hidden" name="inquiryId" value={inquiry.id} />
                  <Field label="Assigned lawyer">
                    <select name="lawyerId" required defaultValue="" className={inputClass}>
                      <option value="" disabled>Select lawyer</option>
                      {lawyers.map((lawyer) => <option key={lawyer.user_id} value={lawyer.user_id}>{lawyer.display_name} — {lawyer.role.replaceAll('_', ' ')}</option>)}
                    </select>
                  </Field>
                  <Field label="Consultation method">
                    <select name="mode" defaultValue="office" className={inputClass}>
                      <option value="office">Office meeting</option><option value="phone">Telephone</option><option value="video">Video call</option>
                    </select>
                  </Field>
                  <Field label="Start — Philippine time"><input type="datetime-local" name="scheduledStart" required className={inputClass} /></Field>
                  <Field label="End — Philippine time"><input type="datetime-local" name="scheduledEnd" required className={inputClass} /></Field>
                  <div className="lg:col-span-2"><Field label="Documents to bring or office instructions"><textarea name="notes" rows={4} maxLength={2000} className={inputClass} /></Field></div>
                  <button className={primaryButtonClass}>Schedule consultation</button>
                </form>
              </>
            )}

            {consultations.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold">Consultation records for this email address</h3>
                <div className="mt-4 grid gap-3">
                  {consultations.map((consultation) => (
                    <article key={consultation.id} className="rounded-md border border-border bg-background p-5">
                      <div className="flex flex-wrap justify-between gap-3">
                        <p className="text-lg font-semibold capitalize">{consultation.status}</p>
                        <p className="capitalize">{consultation.consultation_mode}</p>
                      </div>
                      <p className="mt-2">
                        {consultation.scheduled_start
                          ? `${new Date(consultation.scheduled_start).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} to ${new Date(consultation.scheduled_end ?? consultation.scheduled_start).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila' })}`
                          : `Requested ${consultation.requested_date} — ${consultation.requested_time_window}`}
                      </p>
                      {consultation.notes ? <p className="mt-2 text-sm text-muted-foreground">{consultation.notes}</p> : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </Panel>
        </>
      )}
    </>
  );
}

function Panel({ title, icon, className = '', children }: { title: string; icon: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-lg border border-border bg-card p-6 shadow-sm ${className}`}>
      <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
        {icon}<h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Definition({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[190px_1fr]">
      <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
      <dd className={strong ? 'font-mono text-lg font-bold' : 'text-base'}>{value}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-base font-semibold">{label}{children}</label>;
}

function nextActionText(intake: IntakeRow | null, decision: ConflictDecisionRow | null, unreviewedCount: number) {
  if (!intake) return 'Secretary or intake staff should start the structured review.';
  if (!intake.status.includes('conflict') && !decision) return 'Complete the party list, including opposing parties, then run the conflict search.';
  if (unreviewedCount > 0) return `An authorized lawyer must review ${unreviewedCount} conflict warning${unreviewedCount === 1 ? '' : 's'}.`;
  if (!decision) return 'An authorized lawyer must record the overall conflict decision.';
  if (decision.disposition === 'cleared' || decision.disposition === 'conditional') return 'Conflict review permits consultation scheduling. Staff should reserve the lawyer and time.';
  if (decision.disposition === 'conflicted') return 'Do not proceed. Follow the approved office process for a declined prospective client.';
  return 'The lawyer deferred the decision. Collect the missing information and run a new review when ready.';
}

const inputClass = 'min-h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base font-normal';
const primaryButtonClass = 'inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground';
const secondaryButtonClass = 'inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-background px-5 text-base font-semibold';
