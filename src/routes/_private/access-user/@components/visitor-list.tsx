import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, FileCheck, FileClock, ImageOff, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { toast } from 'sonner';
import DefaultEmptyData from '@/components/default-empty-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ItemActions, ItemGroup, ItemHeader, ItemTitle } from '@/components/ui/item';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { applyCpfMask } from '@/lib/masks';
import { useAccessUserApi } from '../@hooks/use-access-user-api';
import type { GuestProps, UserSyncStatus } from '../@interface/access-user.interface';

interface VisitorListProps {
  guests: GuestProps[];
  syncStatuses?: UserSyncStatus[];
  onAdd: () => void;
  onEdit: (id: string) => void;
}

type VisitorItem = GuestProps & { _resolvedId: string; syncStatus?: UserSyncStatus };

export function VisitorList({ guests, syncStatuses, onAdd, onEdit }: VisitorListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [guestToDelete, setGuestToDelete] = useState<{ id: string; name: string } | null>(null);
  const { deleteGuest } = useAccessUserApi();

  const items = useMemo(
    (): VisitorItem[] =>
      guests.map((guest) => {
        const id = guest._id || guest.id || '';
        const syncStatus = syncStatuses?.find((s) => s.user.id === id);
        return { ...guest, _resolvedId: id, syncStatus };
      }),
    [guests, syncStatuses],
  );

  function handleConfirmDelete() {
    if (!guestToDelete) return;
    deleteGuest.mutate(guestToDelete.id, {
      onSuccess: () => {
        toast.success('Visitante excluído com sucesso!');
        setGuestToDelete(null);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || 'Erro ao excluir visitante.');
        setGuestToDelete(null);
      },
    });
  }

  const columns = useMemo<ColumnDef<VisitorItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
        cell: ({ row }) => <span className="font-medium">{row.original.name || '-'}</span>,
      },
      {
        accessorKey: 'cpf',
        header: 'CPF',
        cell: ({ row }) => applyCpfMask(row.original.cpf || ''),
      },
      {
        accessorKey: 'birthday',
        header: 'Nascimento',
        cell: ({ row }) => (row.original.birthday ? new Date(row.original.birthday).toLocaleDateString('pt-BR') : '-'),
      },
      {
        id: 'acesso',
        header: 'Acesso',
        cell: () => <span className="text-muted-foreground">-</span>,
      },
      {
        accessorKey: 'registration_complete',
        header: 'Status',
        cell: ({ row }) => {
          const completed = row.original.registration_complete;
          if (completed === true) {
            return (
              <div className="flex gap-2">
                <FileCheck className="size-4 text-green-600" />
                <ImageOff className="size-4 text-yellow-600" />
              </div>
            );
          }
          if (completed === false) {
            return (
              <div className="flex gap-2">
                <FileClock className="size-4 text-yellow-600" />
                <ImageOff className="size-4 text-yellow-600" />
              </div>
            );
          }
          return (
            <div className="flex gap-2">
              <FileClock className="size-4 text-gray-500" />
              <ImageOff className="size-4 text-gray-500" />
            </div>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(row.original._resolvedId)}>
                  <Pencil className="mr-2 size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => setGuestToDelete({ id: row.original._resolvedId, name: row.original.name || '' })}>
                  <Trash2 className="mr-2 size-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [onEdit],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: { pageSize: 5 },
    },
  });

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  return (
    <>
      <ItemGroup className="gap-4">
        <ItemHeader>
          <ItemTitle className="text-lg">Visitantes</ItemTitle>
          <ItemActions>
            <Button size="sm" onClick={onAdd}>
              <Plus className="mr-2 size-4" />
              Adicionar
            </Button>
          </ItemActions>
        </ItemHeader>

        {items.length === 0 ? (
          <DefaultEmptyData />
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="cursor-pointer" onClick={() => onEdit(row.original._resolvedId)}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {items.length > 5 && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Exibindo {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
                  {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, items.length)} de {items.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => table.setPageIndex(page - 1)}>
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </ItemGroup>

      <AlertDialog open={!!guestToDelete} onOpenChange={() => setGuestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Visitante</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir o visitante {guestToDelete?.name}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
