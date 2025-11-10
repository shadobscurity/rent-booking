insert into products (slug, name, brand, description, base_price, extra_day, deposit)
values
('serene-satin', 'Serene Satin Gown', 'Runa', 'Gaun satin elegan.', 350000, 75000, 300000),
('blush-midi', 'Blush Midi Dress', 'Runa', 'Midi dress feminin.', 250000, 60000, 200000);

insert into variants (product_id, size, sku) select id, 'S', slug||'-S' from products where slug='serene-satin';
insert into variants (product_id, size, sku) select id, 'M', slug||'-M' from products where slug='serene-satin';
insert into variants (product_id, size, sku) select id, 'S', slug||'-S' from products where slug='blush-midi';
insert into variants (product_id, size, sku) select id, 'M', slug||'-M' from products where slug='blush-midi';

-- Each variant gets 1 physical inventory piece
insert into inventories (variant_id, code)
select id, 'INV-'||id from variants;
