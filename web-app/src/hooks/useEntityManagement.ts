import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}

export function useEntityManagement<T extends BaseEntity>(
    initialData: T[],
    filterPredicate: (entity: T, search: string) => boolean,
    entityName: string = "elemento"
) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { showNotification } = useNotification();
    const [entities, setEntities] = useState<T[]>(initialData);
    const [search, setSearch] = useState("");
    
    // Pagination & Sorting State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState<keyof T>("created_at" as keyof T);
    const [order, setOrder] = useState<"asc" | "desc">("desc");

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<T | undefined>(undefined);
    
    // Custom Confirmation State (for Point 3)
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        message: "",
        onConfirm: () => {},
    });

    // Initial check for dashboard link (?openModal=true)
    useEffect(() => {
        if (searchParams.get("openModal") === "true") {
            setEditingEntity(undefined);
            setIsDialogOpen(true);
            
            // Clean up the URL
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("openModal");
            setSearchParams(newParams);
        }
    }, [searchParams, setSearchParams]);

    const handleOpenCreate = () => {
        setEditingEntity(undefined);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (entity: T) => {
        setEditingEntity(entity);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingEntity(undefined);
        setIsDialogOpen(false);
    };

    const handleSaveEntity = (data: Omit<T, keyof BaseEntity>) => {
        if (editingEntity) {
            // Update
            setEntities((prev) =>
                prev.map((e) =>
                    e.id === editingEntity.id 
                    ? ({ ...e, ...data, updated_at: new Date().toISOString() } as T)
                    : e
                )
            );
            showNotification(`¡${entityName} actualizado correctamente!`, "success");
        } else {
            // Create
            const newEntity = {
                ...data,
                id: Math.random().toString(36).slice(2, 11),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as T;
            setEntities((prev) => [newEntity, ...prev]);
            showNotification(`¡${entityName} creado correctamente!`, "success");
        }
        handleCloseDialog();
    };

    const handleDeleteEntity = (id: string, customEntityName: string = entityName) => {
        setConfirmState({
            open: true,
            title: `Eliminar ${customEntityName}`,
            message: `¿Estás seguro de que deseas eliminar este ${customEntityName}? Esta acción es irreversible.`,
            onConfirm: () => {
                setEntities((prev) => prev.filter((e) => e.id !== id));
                showNotification(`${customEntityName} eliminado con éxito`, "info");
                setConfirmState((prev) => ({ ...prev, open: false }));
            },
        });
    };

    const handleSort = (property: keyof T) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleExport = () => {
        const headers = Object.keys(entities[0] || {}).join(",");
        const rows = entities.map(e => Object.values(e).join(",")).join("\n");
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_${entityName}.csv`);
        document.body.appendChild(link);
        link.click();
        showNotification("Exportación generada correctamente", "success");
    };

    // Derived Logic
    const sortedEntities = [...entities].sort((a, b) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        if (aVal < bVal) return order === "asc" ? -1 : 1;
        if (aVal > bVal) return order === "asc" ? 1 : -1;
        return 0;
    });

    const filteredEntities = sortedEntities.filter((e) => filterPredicate(e, search));
    const paginatedEntities = filteredEntities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return {
        entities: paginatedEntities,
        totalCount: filteredEntities.length,
        search,
        setSearch,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        order,
        orderBy,
        handleSort,
        handleExport,
        isDialogOpen,
        editingEntity,
        handleOpenCreate,
        handleOpenEdit,
        handleCloseDialog,
        handleSaveEntity,
        handleDeleteEntity,
        confirmState,
        setConfirmState,
    };
}
