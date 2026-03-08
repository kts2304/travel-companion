-- Rebuilds expense_splits so totals match exactly and payer is excluded from owing.
-- Run once for existing data after deploying rounding fixes.

drop table if exists _recomputed_expense_splits;

create temporary table _recomputed_expense_splits as
with base as (
  select
    e.id as expense_id,
    e.total_amount,
    e.paid_by_member_id,
    e.trip_id
  from expenses e
  group by e.id, e.total_amount, e.paid_by_member_id, e.trip_id
),
all_members as (
  select
    n.expense_id,
    m.id as member_id,
    case when m.id = n.paid_by_member_id then 0 else 1 end as is_non_payer,
    row_number() over (
      partition by n.expense_id
      order by case when m.id = n.paid_by_member_id then 0 else 1 end, m.id
    ) as member_index,
    count(*) over (partition by n.expense_id) as total_member_count,
    (round(n.total_amount * 100))::bigint as total_paise
  from base n
  join members m on m.trip_id = n.trip_id
)
select
  expense_id,
  member_id,
  (
    (
      (total_paise / total_member_count)
      + case when member_index <= (total_paise % total_member_count) then 1 else 0 end
    )::numeric / 100
  )::numeric(10,2) as owed_amount
from all_members
where is_non_payer = 1;

delete from expense_splits;

insert into expense_splits (expense_id, member_id, owed_amount)
select expense_id, member_id, owed_amount
from _recomputed_expense_splits;
