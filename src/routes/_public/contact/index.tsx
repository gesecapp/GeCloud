import { createFileRoute } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import { ExternalLink, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ItemTitle } from '@/components/ui/item';

export const Route = createFileRoute('/_public/contact/')({
  component: ContactPage,
});

interface ContactAction {
  label: string;
  href: string;
  ActionIcon: LucideIcon;
  external: boolean;
}

interface ContactItem {
  Icon: LucideIcon;
  title: string;
  info: string;
  description: string;
  action: ContactAction;
}

const contactItems: ContactItem[] = [
  {
    Icon: Mail,
    title: 'Email',
    info: 'gesec@gesec.com.br',
    description: 'Entre em contato para dúvidas, sugestões ou mais informações sobre nossos serviços.',
    action: {
      label: 'Enviar Email',
      href: 'mailto:gesec@gesec.com.br',
      ActionIcon: Mail,
      external: false,
    },
  },
  {
    Icon: MapPin,
    title: 'Endereço',
    info: 'Av. Rio Branco, 404 - Centro, Florianópolis - SC, 88015-200',
    description: 'Visite nosso escritório em Florianópolis. Atendemos de segunda a sexta, das 8h às 18h.',
    action: {
      label: 'Google Maps',
      href: 'https://www.google.com/maps/search/Av.+Rio+Branco,+404,+Centro,+Florian%C3%B3polis,+SC',
      ActionIcon: ExternalLink,
      external: true,
    },
  },
];

function ContactPage() {
  return (
    <section className="py-16 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="font-extrabold text-3xl">Contato</h1>
          </div>

          <div className="space-y-8">
            {contactItems.map(({ Icon, title, info, description, action }) => (
              <div key={title} className="border-border border-b pb-8 last:border-b-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="flex flex-col gap-2 md:w-2/3">
                    <div className="flex items-stretch gap-3">
                      <Icon className="size-5" />
                      <ItemTitle className="text-xl">{title}</ItemTitle>
                    </div>
                    <p className="text-lg text-muted-foreground">{info}</p>
                    <p>{description}</p>
                  </div>
                  <div className="md:w-1/3 md:text-right">
                    <Button variant="outline" asChild>
                      <a href={action.href} {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        <action.ActionIcon className="mr-2 h-4 w-4" />
                        {action.label}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
