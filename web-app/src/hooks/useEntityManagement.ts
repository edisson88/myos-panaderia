import { useState, useCallback, useMemo } from "react";

interface EntityManagementState<T> {
  entities: T[];
  totalCount: number;
  search: string;
  setSearch: (value: string) => void;
  page: number;
  setPage: (value: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (value: number) => void;
  order: "asc" | "desc";
  orderBy: string;
  handleSort: (field: string) => void;
  isDialogOpen: boolean;
  editingEntity: T | null;
  handleOpenEdit: (entity: T) => void;
  handleCloseDialog: () => void;
  handleSaveEntity: (entity: T) => void;
  handleDeleteEntity: (id: string | number, entityName: string) => void;
  confirmState: {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  setConfirmState: (state: any) => void;
}

export function useEntityManagement<T extends { id: string | number }>(
  initialData: T[],
  searchFilter: (entity: T, query: string) => boolean,
  _entityName: string,
): EntityManagementState<T> {
  const [entities, setEntities] = useState<T[]>(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<T | null>(null);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => searchFilter(entity, search));
  }, [entities, search, searchFilter]);

  const sortedEntities = useMemo(() => {
    const sorted = [...filteredEntities];
    sorted.sort((a: any, b: any) => {
      const aValue = a[orderBy] ?? "";
      const bValue = b[orderBy] ?? "";

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredEntities, order, orderBy]);

  const paginatedEntities = useMemo(() => {
    return sortedEntities.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [sortedEntities, page, rowsPerPage]);

  const handleSort = useCallback((field: string) => {
    setOrder((prev) => (orderBy === field && prev === "asc" ? "desc" : "asc"));
    setOrderBy(field);
  }, [orderBy]);

  const handleOpenEdit = useCallback((entity: T) => {
    setEditingEntity(entity);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingEntity(null);
  }, []);

  const handleSaveEntity = useCallback((entity: T) => {
    if (editingEntity) {
      setEntities((prev) =>
        prev.map((e) => (e.id === entity.id ? entity : e)),
      );
    } else {
      setEntities((prev) => [...prev, entity]);
    }
    handleCloseDialog();
  }, [editingEntity, handleCloseDialog]);

  const handleDeleteEntity = useCallback(
    (id: string | number, entityNameSingular: string) => {
      setConfirmState({
        open: true,
        title: `Eliminar ${entityNameSingular}`,
        message: `¿Estás seguro que deseas eliminar este ${entityNameSingular}?`,
        onConfirm: () => {
          setEntities((prev) => prev.filter((e) => e.id !== id));
          setConfirmState((prev: any) => ({ ...prev, open: false }));
        },
      });
    },
    [],
  );

  return {
    entities: paginatedEntities,
    totalCount: sortedEntities.length,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    order,
    orderBy,
    handleSort,
    isDialogOpen,
    editingEntity,
    handleOpenEdit,
    handleCloseDialog,
    handleSaveEntity,
    handleDeleteEntity,
    confirmState,
    setConfirmState,
  };
}
