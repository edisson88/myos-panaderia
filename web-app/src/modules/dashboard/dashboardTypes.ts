export type Kpi = {
    label: string;
    value: string;
    helper: string;
    chipLabel: string;
    chipColor: "success" | "warning" | "error" | "default";
};

export type QuickAction = {
    title: string;
    description: string;
    icon: string;
};

export type AlertItem = {
    title: string;
    description: string;
    icon: string;
};

export type RecentOrderRow = {
    date: string;
    customer: string;
    delivery: string;
    total: string;
    statusLabel: string;
    statusColor: "success" | "warning" | "error" | "default";
    actions: Array<{ label: string }>;
};