create or replace function validate_expense_split_member()
returns trigger as $$
begin
  if exists (
    select 1
    from expenses e
    where e.id = new.expense_id
      and e.paid_by_member_id = new.member_id
  ) then
    raise exception 'Payer cannot be part of expense_splits for the same expense';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_validate_expense_split_member on expense_splits;
create trigger trg_validate_expense_split_member
before insert or update on expense_splits
for each row
execute function validate_expense_split_member();
