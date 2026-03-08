alter table expenses
add column if not exists expense_date date not null default current_date;
