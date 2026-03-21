import { MinusIcon, PlusIcon } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const title = 'Abas com Ícone à Esquerda';

const data = [
  { value: '1', title: 'Gestão integrada de acessos', content: 'Controle completo de entrada e saída de pessoas, veículos e materiais com registro em tempo real.' },
  { value: '2', title: 'Monitoramento contínuo de áreas', content: 'Acompanhamento em tempo real de todas as áreas monitoradas com alertas automáticos e histórico detalhado.' },
  { value: '3', title: 'Relatórios e auditoria simplificados', content: 'Geração de relatórios personalizados com filtros avançados para auditoria e conformidade operacional.' },
  { value: '4', title: 'Comunicação centralizada de equipes', content: 'Canal unificado para comunicação entre equipes de segurança, portaria e administração predial.' },
];

const Example = () => (
  <Accordion className="flex w-full max-w-md flex-col gap-2" collapsible defaultValue={data[0].value} type="single">
    {data.map((item) => (
      <AccordionItem className="overflow-hidden rounded-lg border bg-background px-4 last:border-b" key={item.value} value={item.value}>
        <AccordionTrigger className="group hover:no-underline [&>svg]:hidden">
          <div className="flex w-full items-center gap-3">
            <div className="relative size-4 shrink-0">
              <PlusIcon className="absolute inset-0 size-4 text-muted-foreground transition-opacity duration-200 group-data-[state=open]:opacity-0" />
              <MinusIcon className="absolute inset-0 size-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-data-[state=open]:opacity-100" />
            </div>
            <span className="flex-1 text-left">{item.title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="ps-7">
          <p className="text-muted-foreground">{item.content}</p>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export default Example;
