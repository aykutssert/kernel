## Bucket

```
product-images
product-results
product-template-images
```


## Tables
```
create table public.product_templates (
  id uuid not null default gen_random_uuid (),
  category text not null,
  name text not null,
  image_url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint product_templates_pkey primary key (id),
  constraint product_templates_category_check check (
    (
      category = any (
        array[
          'beauty_wellness'::text,
          'home_living'::text,
          'food_beverage'::text,
          'pet_products'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists product_templates_active_category_idx on public.product_templates using btree (category, is_active, sort_order) TABLESPACE pg_default;
```

```
create table public.products (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  category text not null,
  name text not null,
  image_url text not null,
  product_prompt text null,
  created_at timestamp with time zone not null default now(),
  constraint products_pkey primary key (id),
  constraint products_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint products_category_check check (
    (
      category = any (
        array['home_decor'::text, 'beauty_wellness'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists products_user_created_idx on public.products using btree (user_id, created_at desc) TABLESPACE pg_default;

create index IF not exists products_category_idx on public.products using btree (category) TABLESPACE pg_default;
```

```
create table public.product_results (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  product_id uuid not null,
  template_id uuid null,
  image_size text not null,
  final_prompt text not null,
  negative_prompt text not null,
  image_url text null,
  status text not null default 'pending'::text,
  created_at timestamp with time zone not null default now(),
  constraint product_results_pkey primary key (id),
  constraint product_results_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint product_results_template_id_fkey foreign KEY (template_id) references product_templates (id) on delete set null,
  constraint product_results_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint product_results_image_size_check check (
    (
      image_size = any (
        array[
          '1:1'::text,
          '4:5'::text,
          '9:16'::text,
          '16:9'::text
        ]
      )
    )
  ),
  constraint product_results_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'completed'::text,
          'failed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists product_results_user_created_idx on public.product_results using btree (user_id, created_at desc) TABLESPACE pg_default;

create index IF not exists product_results_product_created_idx on public.product_results using btree (product_id, created_at desc) TABLESPACE pg_default;
```
