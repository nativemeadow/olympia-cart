<?php

namespace Database\Factories;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProductVariant::class;

    /**
     * Define the model's default state.
     * This only handles columns directly on the 'product_variants' table.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'sku' => $this->faker->unique()->ean8(),
            'price' => $this->faker->numberBetween(1000, 20000), // Price in cents ($10.00 - $200.00)
            'stripe_price_id' => 'price_' . $this->faker->unique()->regexify('[a-zA-Z0-9]{14}'),
        ];
    }

    /**
     * Configure the model factory to handle relationships after creation.
     *
     * @return $this
     */
    public function configure()
    {
        return $this->afterCreating(function (ProductVariant $variant) {
            // This function runs after the ProductVariant above is saved to the database.
            // Now we have a $variant->id to link everything to.

            // --- Example: Create and attach a "Size" attribute ---

            // 1. Get or create the parent "Size" attribute to avoid duplicates.
            $sizeAttribute = Attribute::firstOrCreate(['name' => 'Size']);

            // 2. Create a specific value for this size attribute.
            $sizeValue = AttributeValue::factory()->create([
                'attribute_id' => $sizeAttribute->id,
                'value' => $this->faker->randomElement(['5 kg', '10 kg', '25 kg']),
            ]);

            // --- Example: Create and attach a "Unit" attribute ---

            // 1. Get or create the parent "Unit" attribute.
            $unitAttribute = Attribute::firstOrCreate(['name' => 'Unit']);

            // 2. Create a specific value for this unit attribute.
            $unitValue = AttributeValue::factory()->create([
                'attribute_id' => $unitAttribute->id,
                'value' => $this->faker->randomElement(['Each', 'Bag', 'Case']),
            ]);

            // 3. Attach the created values to the variant using the pivot table.
            // The sync() method handles creating the records in 'attribute_value_product_variant'.
            $variant->attributeValues()->sync([$sizeValue->id, $unitValue->id]);
        });
    }
}
