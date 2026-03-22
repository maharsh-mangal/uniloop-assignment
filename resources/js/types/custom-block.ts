export interface CustomBlock {
    id: number;
    name: string;
    type: string;
    description: string | null;
    icon_name: string;
    source_code: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CustomBlockResource {
    data: CustomBlock;
}

export interface CustomBlockCollection {
    data: CustomBlock[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface CustomBlockFilters {
    search: string;
    status: string;
}

export interface CustomBlockStats {
    total: number;
    active: number;
}
