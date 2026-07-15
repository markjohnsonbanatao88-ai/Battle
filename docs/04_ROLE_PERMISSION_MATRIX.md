# Role and Permission Matrix

## Permission model

Authorization combines:

1. Active authenticated identity.
2. Active firm membership and role.
3. Matter membership/access level where required.
4. Object classification and explicit shares.
5. AAL2 MFA for sensitive actions.
6. Optional expiry for external and portal access.

A broad role never bypasses `highly_restricted` matter allowlists except through the emergency-access workflow.

## Firm roles

| Capability | Firm Admin | Managing Partner | Partner | Associate | Paralegal | Legal Secretary | Billing | External Collaborator |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| View firm configuration | Yes | Yes | Limited | No | No | Limited | Limited | No |
| Manage users/roles | Yes, AAL2 | Yes, AAL2 | No | No | No | No | No | No |
| View all standard matters | Metadata only by default | Yes | Yes if firm policy | Assigned | Assigned | Assigned | Billing metadata where authorized | Explicit assigned only |
| View highly restricted matter | Explicit access only | Explicit access only | Explicit access only | Explicit access only | Explicit access only | Explicit access only | Explicit access only | Explicit access only |
| Create intake | Yes | Yes | Yes | Yes | Yes | Yes | No | No |
| Decide conflict | No unless lawyer role also exists | Yes | Yes | Configurable reviewer | No | No | No | No |
| Open/close matter | No unless legal approval delegated | Yes | Yes | Propose only | No | No | No | No |
| Manage matter team | Admin support with approval | Yes | Matter manager | If manager | No | No | No | No |
| Create/edit matter work | By matter access | Yes | Yes | Assigned | Assigned contributor | Assigned contributor | Financial scope only | Explicit scope |
| Delete/archive final document | No direct delete | Archive with AAL2 | Archive if manager/AAL2 | No | No | No | No | No |
| Share document with client | By policy; not automatic | Yes | Matter manager | If granted | Propose | If granted | Invoice docs only | No |
| Approve time/expense | No | Yes | Yes | If designated | No | No | Billing workflow | No |
| Issue/void invoice | No | Approve | Approve if permitted | No | No | No | Prepare/issue per policy | No |
| Full export | Admin plus approval/AAL2 | Approve/AAL2 | Matter export only | Matter export if granted | No | No | Financial export | No |
| View audit | Security metadata | Yes | Matter audit | Own/assigned matter audit | Own actions | Own/assigned actions | Financial audit | Own actions |

## Matter access levels

### Viewer

- Read permitted matter metadata and objects.
- Cannot upload, edit, share, comment internally or create tasks unless separately granted.

### Contributor

- Viewer rights.
- Create and edit non-final work products, tasks, notes and communications within role scope.
- Cannot manage access, close matter, approve conflict, finalize documents or issue invoices.

### Manager

- Contributor rights.
- Manage team, classifications, sharing, workflow approvals and matter lifecycle subject to role gates.

## Client portal permissions

Portal permissions are per object, not equivalent to staff roles.

| Portal object | Client default |
|---|---|
| Matter title/status summary | Explicit matter portal membership only |
| Internal notes/strategy/conflict data | Never |
| Document | Explicit share required |
| Message thread | Explicit portal-visible thread |
| Appointment | Participant or share required |
| Client request | Assigned recipient |
| Invoice/receipt | Explicit billing share |
| Staff directory | Minimal approved contact information only |

## Sensitive actions requiring AAL2

- User role or membership changes.
- External collaborator invitation or extension.
- Highly restricted matter access changes.
- Full or bulk exports.
- Archive/destruction authorization.
- Emergency access.
- Security policy changes.
- Billing configuration and invoice voids above configured thresholds.
- API/integration secret rotation.

## RLS expectations

- `firm_id` equality is necessary but not sufficient for matters, documents, tasks, communications, time and billing.
- Every matter child policy calls an approved matter-access function or joins through explicit membership.
- Portal policies use portal memberships and share tables, never staff membership.
- Admin UI visibility cannot substitute for database enforcement.
