export const PRODUCT_TEMPLATE_CATEGORIES = [
  { value: 'beauty_wellness', label: 'Beauty & Wellness' },
  { value: 'home_living', label: 'Home & Living' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'pet_products', label: 'Pet Products' },
] as const

export type ProductTemplateCategory = (typeof PRODUCT_TEMPLATE_CATEGORIES)[number]['value']

export const PRODUCT_TEMPLATE_CATEGORY_LABELS = Object.fromEntries(
  PRODUCT_TEMPLATE_CATEGORIES.map((category) => [category.value, category.label])
) as Record<ProductTemplateCategory, string>

export const PRODUCT_TEMPLATE_CATEGORY_VALUES = new Set<string>(
  PRODUCT_TEMPLATE_CATEGORIES.map((category) => category.value)
)
