import { Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';

interface StatsCardProps {
  count: string;
  title: string;
  description: string;
}

function StatsCard({ count, title, description }: StatsCardProps) {
  return (
    <Item className="flex-col items-start">
      <ItemTitle className="font-bold text-4xl">{count}</ItemTitle>
      <Separator className="my-1 max-w-40" />
      <ItemContent>
        <ItemTitle className="text-lg">{title}</ItemTitle>
        <ItemDescription className="max-w-xs">{description}</ItemDescription>
      </ItemContent>
    </Item>
  );
}

const stats = [
  {
    count: '15,000M',
    title: 'Progresso da Maratona',
    description: "Você está correndo na frente em suas metas de treino.",
  },
  {
    count: '$10,000+',
    title: 'Investimento',
    description: 'Sua perspicácia financeira está valendo a pena — literalmente.',
  },
  {
    count: '4,500+',
    title: 'Horas de Exercício',
    description: 'Seu compromisso com a saúde é inspirador e suas estatísticas mostram isso.',
  },
  {
    count: '8,200+',
    title: 'Horas de Voluntariado',
    description: 'Suas contribuições causaram um impacto em sua comunidade.',
  },
];

export function DefaultStatsSection() {
  return (
    <section className="container mx-auto px-8 py-10 lg:py-28">
      {/* Header */}
      <Item className="mb-10 flex-col items-start lg:mb-24">
        <ItemTitle className="mb-4 font-bold text-4xl">Transforme sua ideia em startup</ItemTitle>
        <ItemDescription className="max-w-xl text-base">Estamos constantemente tentando nos expressar e concretizar nossos sonhos. Faça parte da mudança.</ItemDescription>
      </Item>

      {/* Content Grid */}
      <div className="grid items-center gap-10 lg:grid-cols-1 lg:gap-24 xl:grid-cols-2">
        {/* Featured Card */}
        <Card className="border-0 bg-accent/50 md:border-0">
          <CardContent className="py-24 text-center">
            <Item className="flex-col items-center justify-center">
              <ItemContent className="items-center">
                <ItemTitle className="font-bold text-5xl text-emerald-500">
                  <Leaf className="mr-2 inline size-10" />
                  1,000Kg
                </ItemTitle>
                <ItemDescription className="mt-2 font-bold text-foreground">Emissões de CO2 Compensadas</ItemDescription>
              </ItemContent>

              <Separator className="my-6 w-1/2" />

              <ItemContent className="items-center">
                <ItemTitle className="font-bold text-xl">Conquista Eco Warrior</ItemTitle>
                <ItemDescription className="mt-1 max-w-md text-center text-base">Parabéns por alcançar um novo marco na gestão ambiental!</ItemDescription>
              </ItemContent>
            </Item>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-10 gap-x-20 lg:grid-cols-2">
          {stats.map((props) => (
            <StatsCard key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default DefaultStatsSection;
