import { createFileRoute } from '@tanstack/react-router';
import { AlignLeft, Mail, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_public/privacy-policy/')({
  component: PrivacyPolicyPage,
});

const tocSections = [
  { id: 'section-privacy', label: 'Privacidade e Coleta' },
  { id: 'section-data', label: 'Retenção e Compartilhamento' },
  { id: 'section-rights', label: 'Seus Direitos' },
  { id: 'section-adsense', label: 'Google AdSense' },
  { id: 'section-commitment', label: 'Compromisso do Usuário' },
  { id: 'section-terms', label: 'Termos de Serviço' },
  { id: 'section-legal', label: 'Limitações e Lei' },
  { id: 'section-actions', label: 'Exclusão de Dados' },
];

function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      }
    };

    let observer: IntersectionObserver | null = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 1,
    });

    for (const el of Object.values(sectionRefs.current)) {
      observer?.observe(el);
    }

    return () => {
      observer?.disconnect();
      observer = null;
    };
  }, []);

  const addSectionRef = (id: string, ref: HTMLElement | null) => {
    if (ref) sectionRefs.current[id] = ref;
  };

  return (
    <section className="py-32">
      <div className="container max-w-7xl">
        <div className="relative grid-cols-3 gap-20 lg:grid">
          <div className="lg:col-span-2">
            <div className="mb-12">
              <h1 className="font-extrabold text-3xl">Política de Privacidade</h1>
              <p className="mt-2 text-lg text-muted-foreground">A sua privacidade é importante para nós. Conheça como tratamos seus dados pessoais.</p>
              <p className="mt-1 text-muted-foreground text-xs">Efetiva a partir de 30 de outubro de 2023</p>
            </div>

            <section id="section-privacy" ref={(ref) => addSectionRef('section-privacy', ref)} className="prose dark:prose-invert mb-8">
              <ItemTitle className="text-2xl">Privacidade e Coleta de Informações</ItemTitle>
              <p>
                A sua privacidade é importante para nós. É política da Gesec respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Gesec, e
                outros sites que possuímos e operamos.
              </p>
              <p>
                Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento
                e consentimento. Também informamos por que estamos coletando e como será usado.
              </p>
            </section>

            <section id="section-data" ref={(ref) => addSectionRef('section-data', ref)} className="prose dark:prose-invert mb-8">
              <ItemTitle className="text-2xl">Retenção e Compartilhamento</ItemTitle>
              <p>
                Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios
                comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
              </p>
              <p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>
              <p>
                O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não
                podemos aceitar responsabilidade por suas respectivas políticas de privacidade.
              </p>
            </section>

            <section id="section-rights" ref={(ref) => addSectionRef('section-rights', ref)} className="prose dark:prose-invert mb-8">
              <ItemTitle className="text-2xl">Seus Direitos</ItemTitle>
              <p>Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.</p>
              <p>
                O uso continuado de nosso site será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre
                como lidamos com dados do usuário e informações pessoais, entre em contato conosco.
              </p>
            </section>

            <section id="section-adsense" ref={(ref) => addSectionRef('section-adsense', ref)} className="prose dark:prose-invert mb-8">
              <ItemTitle className="text-2xl">Google AdSense</ItemTitle>
              <p>
                O serviço Google AdSense que usamos para veicular publicidade usa um cookie DoubleClick para veicular anúncios mais relevantes em toda a Web e limitar o número de
                vezes que um determinado anúncio é exibido para você. Para mais informações, consulte as FAQs oficiais sobre privacidade do Google AdSense.
              </p>
              <p>
                Utilizamos anúncios para compensar os custos de funcionamento deste site e fornecer financiamento para futuros desenvolvimentos. Os cookies de publicidade
                comportamental usados por este site foram projetados para garantir que você forneça os anúncios mais relevantes sempre que possível.
              </p>
              <p>
                Vários parceiros anunciam em nosso nome e os cookies de rastreamento de afiliados simplesmente nos permitem ver se nossos clientes acessaram o site através de um
                dos sites de nossos parceiros, para que possamos creditá-los adequadamente e, quando aplicável, permitir que nossos parceiros afiliados ofereçam promoções.
              </p>
            </section>

            <section id="section-commitment" ref={(ref) => addSectionRef('section-commitment', ref)} className="prose dark:prose-invert mb-8">
              <ItemTitle className="text-2xl">Compromisso do Usuário</ItemTitle>
              <p>O usuário se compromete a fazer uso adequado dos conteúdos e da informação que a Gesec oferece:</p>
              <ul>
                <li>Não se envolver em atividades ilegais ou contrárias à boa fé e à ordem pública;</li>
                <li>Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, pornografia ilegal, apologia ao terrorismo ou contra os direitos humanos;</li>
                <li>
                  Não causar danos aos sistemas físicos e lógicos do Gesec, de seus fornecedores ou terceiros, para introduzir ou disseminar vírus informáticos ou quaisquer outros
                  sistemas capazes de causar danos.
                </li>
              </ul>
            </section>

            <section id="section-terms" ref={(ref) => addSectionRef('section-terms', ref)} className="prose dark:prose-invert mb-8">
              <ItemTitle className="text-2xl">Termos de Serviço</ItemTitle>
              <p>
                Ao acessar ao site Gesec, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de
                todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site.
              </p>
              <p>
                É concedida permissão para baixar temporariamente uma cópia dos materiais no site Gesec, apenas para visualização transitória pessoal e não comercial. Esta é a
                concessão de uma licença, não uma transferência de título. Sob esta licença, você não pode:
              </p>
              <ul>
                <li>Modificar ou copiar os materiais;</li>
                <li>Usar os materiais para qualquer finalidade comercial ou para exibição pública;</li>
                <li>Tentar descompilar ou fazer engenharia reversa de qualquer software;</li>
                <li>Remover quaisquer direitos autorais ou outras notações de propriedade;</li>
                <li>Transferir os materiais para outra pessoa ou espelhar em qualquer outro servidor.</li>
              </ul>
            </section>

            <section id="section-legal" ref={(ref) => addSectionRef('section-legal', ref)} className="prose dark:prose-invert mb-8">
              <ItemTitle className="text-2xl">Limitações e Lei Aplicável</ItemTitle>
              <p>
                Os materiais no site da Gesec são fornecidos &ldquo;como estão&rdquo;. Gesec não oferece garantias, expressas ou implícitas, e por este meio isenta e nega todas as
                outras garantias, incluindo garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual.
              </p>
              <p>
                Em nenhum caso a Gesec ou seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar os materiais em Gesec, mesmo que
                tenha sido notificado da possibilidade de tais danos.
              </p>
              <p>
                A Gesec pode revisar estes termos de serviço a qualquer momento, sem aviso prévio. Estes termos são regidos e interpretados de acordo com as leis da Gesec e você se
                submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
              </p>
            </section>

            <section id="section-actions" ref={(ref) => addSectionRef('section-actions', ref)} className="mt-16 border-t pt-8">
              <h2 className="mb-8 font-medium text-2xl">Exclusão de Dados</h2>
              <div className="space-y-6">
                <div className="border-border border-b pb-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="md:w-2/3">
                      <div className="mb-2 flex items-center gap-3">
                        <Shield className="size-5 text-blue-700" />
                        <h3 className="font-medium text-lg">Solicitar Exclusão de Conta</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">Solicite a exclusão permanente de sua conta e todos os dados associados.</p>
                    </div>
                    <div className="md:w-1/3 md:text-right">
                      <Button variant="outline" asChild>
                        <a href="mailto:gesec@gesec.com.br?subject=Solicitação%20de%20Exclusão%20de%20Conta">
                          <Mail className="mr-2 h-4 w-4" />
                          Solicitar Exclusão
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="border-border border-b pb-6 last:border-b-0">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="md:w-2/3">
                      <div className="mb-2 flex items-center gap-3">
                        <Shield className="size-5 text-blue-700" />
                        <h3 className="font-medium text-lg">Solicitar Exclusão de Dados</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">Solicite a exclusão dos seus dados enquanto mantém sua conta ativa.</p>
                    </div>
                    <div className="md:w-1/3 md:text-right">
                      <Button variant="outline" asChild>
                        <a href="mailto:gesec@gesec.com.br?subject=Solicitação%20de%20Exclusão%20de%20Dados">
                          <Mail className="mr-2 h-4 w-4" />
                          Solicitar Exclusão
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="sticky top-8 hidden h-fit lg:block">
            <span className="flex items-center gap-2 text-sm">
              <AlignLeft className="h-4 w-4" />
              Nesta página
            </span>
            <nav className="mt-2 text-sm">
              <ul>
                {tocSections.map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className={cn('block py-1 transition-colors duration-200', activeSection === id ? 'font-medium text-primary' : 'text-muted-foreground hover:text-primary')}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
