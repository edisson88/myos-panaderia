export const GET_INVENTORY_QUERY = `
    query GetInventory {
        product_inventory(
            where: { active: { _eq: true } }
            order_by: { product: { name: asc } }
        ) {
            id
            available_quantity
            reserved_quantity
            damaged_quantity
            minimum_stock
            product {
                id
                name
                product_production_config{
                    sale_unit_name
                    units_per_tray
                }
            }
        }
    }
`;