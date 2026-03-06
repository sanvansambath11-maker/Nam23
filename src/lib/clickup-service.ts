// src/lib/clickup-service.ts

const CLICKUP_API_TOKEN = import.meta.env.VITE_CLICKUP_TOKEN || "";
const CLICKUP_LIST_ID = import.meta.env.VITE_CLICKUP_INVENTORY_LIST_ID || "";

export async function createLowStockTask(itemName: string, currentStock: number) {
    if (!CLICKUP_API_TOKEN || !CLICKUP_LIST_ID) {
        console.warn("ClickUp credentials are not set. Skipping task creation.");
        return null;
    }

    const url = `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': CLICKUP_API_TOKEN
            },
            body: JSON.stringify({
                name: `URGENT: Re-order ${itemName}`,
                description: `Inventory alert! We only have ${currentStock} left in stock.`,
                status: 'TO DO',
                priority: 2 // 1 is Urgent, 2 is High, 3 is Normal, 4 is Low
            })
        });

        if (!response.ok) {
            throw new Error(`ClickUp API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to create ClickUp task:", error);
        return null; /* Don't crash the POS just because ClickUp failed */
    }
}
