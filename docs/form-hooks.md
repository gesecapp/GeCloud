# Padrao de Hook de Formulario e Componente de Form

## Hook de Formulario

Arquivo: `@hooks/use-{feature}-form.ts`

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useGeofencesApi } from '@/hooks/use-geofences-api';
import { type GeofenceFormData, geofenceFormSchema } from '../@interface/geofence.interface';

export function useGeofenceForm(initialData?: Partial<GeofenceFormData>) {
  const { createGeofence, updateGeofence } = useGeofencesApi();

  const form = useForm<GeofenceFormData>({
    resolver: zodResolver(geofenceFormSchema),
    values: initialData as GeofenceFormData,
    defaultValues: {
      color: '#3366FF',
      initializeTravel: false,
      ...initialData,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (data.id) {
      await updateGeofence.mutateAsync({ ...data, id: data.id });
    } else {
      await createGeofence.mutateAsync(data);
    }
  });

  return {
    form,
    onSubmit,
    isPending: createGeofence.isPending || updateGeofence.isPending,
  };
}
```

## Componente de Formulario

Arquivo: `@components/{feature}-form.tsx`

```tsx
import { useFormContext } from 'react-hook-form';

import DefaultFormLayout from '@/components/default-form-layout';
import { EnterpriseSelect } from '@/components/selects';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import type { GeofenceFormData } from '../@interface/geofence.interface';

export function GeofenceForm() {
  const form = useFormContext<GeofenceFormData>();

  const sections = [
    {
      title: 'Informações Gerais',
      description: 'Dados básicos da geocerca',
      fields: [
        <FormField
          key="idEnterprise"
          control={form.control}
          name="idEnterprise"
          render={({ field }) => (
            <FormItem>
              <EnterpriseSelect mode="single" value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />,
        <FormField
          key="description"
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Descrição" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />,
        <div key="row-type-code" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Código" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>,
      ],
    },
    {
      title: 'Configurações Avançadas',
      description: 'Opções adicionais da geocerca',
      fields: [
        <div key="row-checks" className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <FormField
            control={form.control}
            name="initializeTravel"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Inicializar viagem</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>,
      ],
    },
  ];

  return <DefaultFormLayout sections={sections} />;
}
```

## Resumo

- Hook usa `zodResolver` + `useForm` com `values` para edicao e `defaultValues` para criacao
- Componente usa `useFormContext` (nao recebe form por props)
- Layout usa `DefaultFormLayout` com array de `sections` contendo `title`, `description`, `fields`
- Selects prontos de `@/components/selects`
