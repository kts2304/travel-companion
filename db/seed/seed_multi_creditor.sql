-- Demo seed: multi-creditor scenario
-- Rule used by app:
-- split denominator includes payer + selected non-payers
-- stored expense_splits contain only non-payer owed rows

insert into trips (id, name, destination, start_date, end_date)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Multi Creditor Demo',
    'Mysuru',
    '2026-05-10',
    '2026-05-12'
  )
on conflict (id) do nothing;

insert into members (id, trip_id, name, email)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Tejas',
    'tejas@example.com'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Mithra',
    'mithra@example.com'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Sruthi',
    'sruthi@example.com'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Harsha',
    'harsha@example.com'
  )
on conflict (id) do nothing;

insert into expenses (id, trip_id, paid_by_member_id, description, total_amount, expense_date)
values
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'Hotel',
    12000.00,
    '2026-05-10'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'Cab + Tickets',
    8000.00,
    '2026-05-11'
  )
on conflict (id) do nothing;

-- Expense 1: 12000, denominator 4, share 3000 each
-- Payer Tejas excluded from stored splits
insert into expense_splits (id, expense_id, member_id, owed_amount)
values
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    3000.00
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    3000.00
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd3',
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
    3000.00
  )
on conflict (id) do nothing;

-- Expense 2: 8000, denominator 4, share 2000 each
-- Payer Mithra excluded from stored splits
insert into expense_splits (id, expense_id, member_id, owed_amount)
values
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd4',
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    2000.00
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd5',
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    2000.00
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd6',
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4',
    2000.00
  )
on conflict (id) do nothing;

-- Expected net:
-- Tejas: +7000
-- Mithra: +3000
-- Sruthi: -5000
-- Harsha: -5000
